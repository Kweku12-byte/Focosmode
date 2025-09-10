// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAd0slJ5HdWVvqKDHoVH82dKuI0MxoYj-0",
  authDomain: "focosmode-39a5e.firebaseapp.com",
  projectId: "focosmode-39a5e",
  storageBucket: "focosmode-39a5e.appspot.com",
  messagingSenderId: "611401482926",
  appId: "1:611401482926:web:1a0b898db5add7519be33f",
  measurementId: "G-ENBCWZ2CDC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services so we can use them in other files
export const db = getFirestore(app);
export const auth = getAuth(app);

