import { initializeApp } from "firebase/app"; 
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = { 
  apiKey: "AIzaSyBaJVTabebUR7pgt6msUcLhaN9z-yByU68", 
  authDomain: "itevent-a5f5f.firebaseapp.com", 
  projectId: "itevent-a5f5f", 
  storageBucket: "itevent-a5f5f.firebasestorage.app", 
  messagingSenderId: "665162951308", 
  appId: "1:665162951308:web:48a01f0dc019c975d829a9"
}; 

const app = initializeApp(firebaseConfig); 
const db = getFirestore(app);

async function testFirebase() {
  try {
    await setDoc(doc(db, "events", "test-room-123"), { test: "test" });
    console.log("Firebase Write Success");
  } catch (err) {
    console.error("Firebase Error:");
    console.error("Code:", err.code);
    console.error("Message:", err.message);
  }
  process.exit();
}
testFirebase();
