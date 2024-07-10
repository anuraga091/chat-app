import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDqfrk6w1iJbayRxiInB_x48-Dx-0N7oDs",
  authDomain: "chat-app-cf8a8.firebaseapp.com",
  projectId: "chat-app-cf8a8",
  storageBucket: "chat-app-cf8a8.appspot.com",
  messagingSenderId: "710247008354",
  appId: "1:710247008354:web:e060d4f519fbf2f9a1e93b",
  measurementId: "G-QMRNKLN24G"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
