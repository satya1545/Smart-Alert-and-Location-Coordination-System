import { initializeApp } from "firebase/app"; 
import { getFirestore } from "firebase/firestore"; 
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration 
const firebaseConfig = { 
  apiKey: "AIzaSyBaJVTabebUR7pgt6msUcLhaN9z-yByU68", 
  authDomain: "itevent-a5f5f.firebaseapp.com", 
  projectId: "itevent-a5f5f", 
  storageBucket: "itevent-a5f5f.firebasestorage.app", 
  messagingSenderId: "665162951308", 
  appId: "1:665162951308:web:48a01f0dc019c975d829a9", 
  measurementId: "G-MV8G8E46V3" 
}; 

// Initialize Firebase 
const app = initializeApp(firebaseConfig); 
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
