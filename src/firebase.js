// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);