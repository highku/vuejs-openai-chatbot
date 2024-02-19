<template>
  <div>
    <div class="container mx-auto px-4 format py-2">
      <ChatWindow :thinking="thread.thinking" :messages="thread.messages" />
      <UserInput :thinking="thread.thinking"  @send="sendMessage" />
    </div>
  </div>
</template>

<script>
import { db, storage, functions } from '../firebaseInit.js'; // adjust the path according to your project structure
import { httpsCallable } from 'firebase/functions';
import { collection, doc, query, orderBy, getDocs, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import ChatWindow from './ChatWindow.vue';
import UserInput from './UserInput.vue';
import { mapState } from 'vuex';


export default {
  components: {
    ChatWindow,
    UserInput
  },
  computed: {
    ...mapState(['user'])
  },
  data() {
    return {
      thread: {
        id: this.$route.params.id,
        messages: [],
        messagesListener: null,
        thinking: false
      }
    };
  },
  methods: {
    async sendMessage({ text, files }) {
      this.thread.thinking = true;
      // handle the send event
      // text is the text message
      // files is an array of attached files, or an empty array if no files are attached

      // get the user ID from Vuex store
      const userId = this.user.uid;

      // get the current timestamp
      const timestamp = Date.now();

      // upload files to Firebase Storage
      const uploadPromises = files.map((file, index) => {
        const storageRef = ref(storage, `users/${userId}/threads/${this.thread.id}/${timestamp}_${index}_${file.name}`);
        return uploadBytes(storageRef, file);
      });
      const snapshots = await Promise.all(uploadPromises);

      // get download URLs
      // const urlPromises = snapshots.map(snapshot => getDownloadURL(snapshot.ref));
      // const urls = await Promise.all(urlPromises);
      const filePaths = snapshots.map(snapshot => snapshot.ref.fullPath);

      // add the message to Firestore
      addDoc(collection(doc(db, 'threads', this.thread.id), 'messages'), {
        text: text,
        role: 'user',
        files: filePaths,
        createdAt: serverTimestamp()
      });
    }
  },
  async created() {
    // get the user ID from Vuex store
    const userId = this.user.uid;

    if (this.thread.id === 'new') {
      // invoke a Firebase function to create a new thread
      const createThread = httpsCallable(functions, 'createThread')
      const result = await createThread({ userId: userId });

      // update the thread ID with the ID of the new thread
      this.thread.id = result.data.id;
      this.$router.push({ name: 'Thread', params: { id: result.data.id } });
    }

    // fetch historical messages from Firestore
    const messagesQuery = query(
      collection(db, 'threads', this.thread.id, 'messages'),
      orderBy('createdAt', 'desc')
    );
    const messageSnapshot = await getDocs(messagesQuery);
    messageSnapshot.forEach(doc => {
      this.thread.messages.push(
        {
          id: doc.id,
          ...doc.data()
        }
      );
    });

    // listen for new messages
    const messagesRef = collection(db, 'threads', this.thread.id, 'messages');
    this.messagesListener = onSnapshot(messagesRef, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          if (change.doc.data().role === 'assistant') {
            this.thread.thinking = false;
          }

          const message = change.doc.data();
          if (!this.thread.messages.find(m => m.id === change.doc.id)) {
            if (message.role === "assistant") {
              const { text, ...messageObjWithoutText } = message;
              const textChars = text.split('');
              for (let i = 0; i < textChars.length; i++) {
                setTimeout(() => {
                  if (!this.thread.messages.find(m => m.id === change.doc.id)) {
                    this.thread.messages.unshift({
                      id: change.doc.id,
                      text: text.slice(0, i + 1),
                      ...messageObjWithoutText
                    });
                  } else {
                    this.thread.messages = this.thread.messages.map(m => {
                      if (m.id === change.doc.id) {
                        m.text = text.slice(0, i + 1);
                      }
                      return m;
                    });
                  }
                }, 100);
              }
            } else {
              this.thread.messages.unshift({
                id: change.doc.id,
                ...message
              });
            }
          }
        }
      });
    });
  },
  beforeRouteLeave() {
    if (this.messagesListener) {
      this.messagesListener();
    }
  }
};
</script>