// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDaf3HsOUGUQ8t_DgBc5jAROQs2IU0Un8",
  authDomain: "chatbot-c1f0f.firebaseapp.com",
  projectId: "chatbot-c1f0f",
  storageBucket: "chatbot-c1f0f.appspot.com",
  messagingSenderId: "358101819343",
  appId: "1:358101819343:web:6d39b8b5e81716c4a2bcba",
  measurementId: "G-1EW32WMQMV"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// const analytics = firebase.analytics()

// firebase utils
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const functions = getFunctions(firebaseApp);
const storage = getStorage(firebaseApp);
// const currentUser = auth.currentUser
// const googleAuthProvider = new firebase.auth.GoogleAuthProvider()
// const twitterAuthProvider = new firebase.auth.TwitterAuthProvider()
// const githubAuthProvider = new firebase.auth.GithubAuthProvider()

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099/');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, "localhost",9199)
}

export {firebaseApp as app, db, auth, functions, storage};
