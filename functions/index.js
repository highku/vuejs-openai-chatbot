require('dotenv').config();
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('@google-cloud/firestore');
const { OpenAI } = require("openai");
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDownloadURL } = require('firebase-admin/storage');

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const POLLING_INTERVAL = 2500;
const DEFAULT_ASSISTANT_ID = process.env.DEFAULT_ASSISTANT_ID;

function initializeFirebaseAdmin() {
  admin.initializeApp();
}

function initializeOpenAI() {
  return new OpenAI(process.env.OPENAI_API_KEY);
}

initializeFirebaseAdmin();
const openai = initializeOpenAI();

async function createThreadInFirestore(userId, openaiThreadId) {
  const db = admin.firestore();
  const docRef = await db.collection('threads').add({
    title: 'New Thread',
    createdAt: FieldValue.serverTimestamp(),
    userId: userId,
    openaiThread: openaiThreadId
  });
  return docRef;
}

async function downloadAndUploadFiles(files) {
  const openaiFiles = [];
  for (const filePath of files) {
    const destination = '/tmp/' + uuidv4() + filePath.split('/').pop();
    await admin.storage().bucket().file(filePath).download({ destination: destination });
    const fileCreateResponse = await openai.files.create({
      file: fs.createReadStream(destination),
      purpose: 'assistants'
    });
    openaiFiles.push(fileCreateResponse);
  }
  return openaiFiles;
}

function isFileAcceptedForRetrieval(file) {
  const acceptedExtensions = ['.c', '.cs', '.cpp', '.doc', '.docx', '.html', 
    '.java', '.json', '.md', '.pdf', '.php', '.pptx', 
    '.py', '.rb', '.tex', '.txt', '.css', '.js', '.sh', '.ts'];

  if (acceptedExtensions.some(ext => file.filename.endsWith(ext))) {
    return true;
  }
}

function isFileAcceptedForInterpretation(file) {
  const acceptedExtensions = ['.c', '.cs', '.cpp', '.doc', '.docx', '.html', 
    '.java', '.json', '.md', '.pdf', '.php', '.pptx', 
    '.py', '.rb', '.tex', '.txt', '.css', '.js', '.sh', '.ts', 
    '.csv', '.jpeg', '.jpg', '.gif', '.png', '.tar', '.xlsx', '.xml', '.zip'];

  if (acceptedExtensions.some(ext => file.filename.endsWith(ext))) {
    return true;
  }
}

async function addMessageToOpenAIThread(openaiThread, messageText, openaiFiles, openaiImages) {

  var content = [];
  if (messageText) {
    content.push({ type: 'text', text: messageText });
  }
  for (const image of openaiImages) {
    content.push({ type: 'image_file', image_file: { file_id: image.id } });
  }

  return await openai.beta.threads.messages.create(
    openaiThread,
    { 
      role: 'user', 
      content: content,
      attachments: openaiFiles.map(file => {
        var tools = [];
        if (isFileAcceptedForRetrieval(file)) {
          tools.push({ "type": "file_search" });
        }
        if (isFileAcceptedForInterpretation(file)) {
          tools.push({ "type": "code_interpreter" });
        }
        return {
          file_id: file.id,
          tools: tools
        }
      })
    }
  );
}

async function waitForThreadRunCompletion(openaiThread, runResponse) {
  while (runResponse.status === 'queued' ||  runResponse.status === 'in_progress') {
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    runResponse = await openai.beta.threads.runs.retrieve(openaiThread, runResponse.id);
    console.log(runResponse);
  }
  return runResponse;
}

async function fetchAndSaveFileFromOpenAI(fileId, threadRef, userId, fileType='image') {
  //Retry fetching the file from OpenAI maximum of three times
  let fileContent;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      fileContent = await openai.files.content(fileId);
      break;
    } catch (error) {      
      if (i === MAX_RETRIES - 1) {
        throw error;
      }
      // Add a wait of 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
    }
  }
  const image_data = await fileContent.arrayBuffer();
  const image_data_buffer = Buffer.from(image_data);
  // Save the image to Firebase Storage
  let filePath = `users/${userId}/threads/${threadRef.id}/${fileId}`;
  let fileMetadata = {}

  if (fileType === 'image') {
    filePath += '.png';
    fileMetadata = { contentType: 'image/png' };
  }
  await admin.storage().bucket().file(filePath).save(image_data_buffer, fileMetadata);
  return filePath;
}

async function addMessagesToFirestoreThread(threadRef, newMessages, userId, fromMessageId) {
  //reverse the messages to get the latest message first
  newMessages.data.reverse();
  //remove all messages up to the user message
  const fromMessageIndex = newMessages.data.findIndex(message => message.id === fromMessageId);
  newMessages.data = newMessages.data.slice(fromMessageIndex);
    
  // const batch = admin.firestore().batch();
  let idx = 0;
  while (idx < newMessages.data.length) {
    let message = newMessages.data[idx];
    idx++;

    if (message.role === 'user') {
      continue;
    }
    let textContent = message.content.map(content => content.type === "text" ? content.text.value : '').join(' ');
    const annotations = message.content.map(content => content.type === "text" ? content.text.annotations : []).flat(2); //.filter(annotation => annotation.type === "file_path")
    const fileIds = message.content.filter(content => content.type === "image_file").map(content => content.image_file.file_id);
    const firebaseStorageFiles = await Promise.all(fileIds.map(fileId => fetchAndSaveFileFromOpenAI(fileId, threadRef, userId)));
    
    for (const annotation of annotations) {
      if (annotation.type == 'file_path') {
        const fileId = annotation.file_path.file_id;
        const filePath = await fetchAndSaveFileFromOpenAI(fileId, threadRef, userId, 'text');
        const downloadUrl = await getDownloadURL(admin.storage().bucket().file(filePath)); //throws error in emulator
        textContent = textContent.replace(annotation.text, downloadUrl);
      }
    }

    await admin.firestore().collection('threads').doc(threadRef.id).collection('messages').add({
      text: textContent,
      role: message.role,
      files: firebaseStorageFiles,
      createdAt: FieldValue.serverTimestamp(),
      openaiMessageId: message.id
    });
  };
}

exports.createThread = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  const userId = context.auth.uid;
  const vectorStore = await openai.beta.vectorStores.create();
  const emptyThread = await openai.beta.threads.create(
    {
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStore.id]
        }
      }
    }
  );
  const newThread = await createThreadInFirestore(userId, emptyThread.id);
  await newThread.collection('messages').add({
    text: 'Hello, how can I help you today?',
    role: 'assistant',
    createdAt: FieldValue.serverTimestamp(),
    files: [],
    openaiMessageId: null
  });
  return { id: newThread.id };
});

exports.onMessageAdded = functions.runWith(
    {
      timeoutSeconds: 300
    }
  ).firestore.document('threads/{threadId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const messageData = snapshot.data();
    const threadId = context.params.threadId;
    const threadRef = admin.firestore().collection('threads').doc(threadId);
    // Save message text as previewText in thread
    await threadRef.update({
      previewText: messageData.text ? messageData.text : '📎'
    });

    if (messageData.role === 'assistant') {
      return;
    }

    const threadData = (await threadRef.get()).data();
    const userDoc = await admin.firestore().collection('users').doc(threadData.userId).get();
    let assistantId = null;
    if (!userDoc.exists) {
      // Create a new user doc
      await admin.firestore().collection('users').doc(threadData.userId).set({
        assistant_id: DEFAULT_ASSISTANT_ID
      });
      assistantId = DEFAULT_ASSISTANT_ID;
    } else {
      assistantId = userDoc.data().assistant_id;
    }

    const messageText = messageData.text;
    const openaiThread = threadData.openaiThread;
    const files = messageData.files || [];
    const images = messageData.images || [];
    const openaiFiles = await downloadAndUploadFiles(files);
    const openaiImages = await downloadAndUploadFiles(images);
    const userMessage = await addMessageToOpenAIThread(openaiThread, messageText, openaiFiles, openaiImages);
    await threadRef.collection('messages').doc(snapshot.id).update({
      openaiMessageId: userMessage.id
    });

    let runResponse = await openai.beta.threads.runs.create(openaiThread, { assistant_id: assistantId });
    runResponse = await waitForThreadRunCompletion(openaiThread, runResponse);
    const newMessages = await openai.beta.threads.messages.list(openaiThread, { limit: 10 });
    await addMessagesToFirestoreThread(threadRef, newMessages, threadData.userId, userMessage.id);
    return { status: 'success' };
  });