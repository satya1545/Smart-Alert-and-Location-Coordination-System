# Event Guardian - Real-Time Event Coordination App

Event Guardian is a high-performance, real-time event management and safety application designed for seamless coordination between organizers, volunteers, and participants.

## 🚀 Tech Stack

### **Frontend**
- **React 19**: Modern UI library for building a responsive and dynamic user interface.
- **Vite 8**: Next-generation frontend tooling for lightning-fast development and optimized builds.
- **Lucide React**: Beautifully crafted icons for an intuitive user experience.
- **React Router 7**: Handles client-side navigation between different views (Dashboard, Chat, Map, etc.).

### **Backend & Database**
- **Firebase Firestore**: A NoSQL cloud database that provides real-time data synchronization across all connected devices.
- **Firebase SDK**: Integrated for direct frontend-to-database communication, eliminating the need for a separate custom backend for core features.
- **Socket.io (Optional/Hybrid)**: Included for specialized real-time messaging scenarios (if configured).

### **Mobile Integration**
- **Capacitor 8**: A cross-platform native runtime that allows the React web app to run natively on **Android** and **iOS**.
- **Capacitor Plugins**:
  - **Geolocation**: For real-time map tracking and location-based coordination.
  - **Haptics**: For tactile feedback during panic alerts.

---

## 🛠 How We Executed It

### **1. Real-Time Architecture**
We moved away from traditional polling and implemented a **Pub/Sub architecture** using **Firebase Firestore**. 
- When an organizer creates an event, a unique document is created in Firestore.
- Every device joins a specific "Room" by listening to that document's unique ID.
- Using `onSnapshot`, any change made by one user (like sending a chat or updating a location) is broadcasted to all other devices in milliseconds.

### **2. Role-Based Security**
Access is managed through **Role Keys** (e.g., VOLUNTEER, ORGANIZER). 
- We use a custom **CSPRNG** (Cryptographically Secure Pseudo-Random Number Generator) to generate high-entropy keys.
- These keys are stored in Firestore and mapped to specific roles, ensuring only authorized personnel can access sensitive event data.

### **3. Safety First: The Panic System**
The app features a global **Panic Button**. 
- When triggered, it bypasses standard queues and pushes a high-priority alert to the top of the database.
- Every connected device receives a haptic vibration and a visual overlay instantly, ensuring immediate response during emergencies.

---

## ❓ FAQs & Project Execution

### **Q: How do I run the project on my local machine?**
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Access the app at `http://localhost:5173`

### **Q: How do I test on multiple devices?**
1. Ensure both devices (e.g., your laptop and your phone) are on the same Wi-Fi.
2. Run `npm run dev -- --host`.
3. Open the **Network URL** (e.g., `http://192.168.x.x:5173`) on your second device.

### **Q: How do I deploy to Android Studio?**
1. Generate a production build: `npm run build`
2. Sync with Capacitor: `npx cap sync android`
3. Open in Android Studio: `npx cap open android`
4. Run the project from Android Studio onto your phone.

### **Q: Why are my room codes showing as "Invalid"?**
- **Check Firestore**: Ensure you have enabled the Firestore Database in your Firebase Console and set it to "Test Mode" or updated the rules to allow read/writes.
- **Network**: Ensure your device has an active internet connection to reach Firebase.
- **Fresh Event**: If you recently changed your Firebase config, old codes will no longer work. Create a new event to generate valid codes.

### **Q: Is the chat history saved?**
Yes. Because we use Firestore, all messages and alerts are persistently stored. If you close the app and reopen it, the history will be reloaded automatically from the cloud.

---

## 📜 License
Developed by [satya1545](https://github.com/satya1545) as part of the Final Project.
