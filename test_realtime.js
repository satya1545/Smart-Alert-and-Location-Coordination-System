import { initializeApp } from "firebase/app"; 
import { getFirestore, collection, query, orderBy, limit, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";

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

async function testRealTime() {
  try {
    console.log("Fetching the most recent event...");
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No events found! Create an event first.");
      process.exit();
    }

    const eventDoc = snapshot.docs[0];
    const eventId = eventDoc.id;
    console.log(`Found event: ${eventDoc.data().name} (ID: ${eventId})`);

    const newAlert = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'EMERGENCY',
      sender: '🤖 AI Test Bot',
      target: 'EVERYONE',
      message: 'Hello! This is a real-time test alert injected directly into the backend. If you are seeing this instantly without refreshing, multiple-device synchronization is working perfectly! 🎉'
    };

    console.log("Injecting test alert to Firebase...");
    await updateDoc(doc(db, "events", eventId), {
      alerts: arrayUnion(newAlert)
    });

    console.log("✅ Alert sent successfully! Check your browser, it should have appeared instantly.");
  } catch (err) {
    console.error("Firebase Error:", err);
  }
  process.exit();
}

testRealTime();
