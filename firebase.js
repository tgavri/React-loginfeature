// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAi1dEsyLVMmwuen9TTXB_PTYG3RrDdf_Q",
  authDomain: "auth-c247e.firebaseapp.com",
  projectId: "auth-c247e",
  storageBucket: "auth-c247e.firebasestorage.app",
  messagingSenderId: "996265594623",
  appId: "1:996265594623:web:dfaab2189a8a308018c6ca",
  measurementId: "G-S7718210S1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);