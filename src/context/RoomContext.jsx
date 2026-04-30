import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { generateRoleKey } from '../utils/cryptoUtils';
import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  arrayUnion 
} from "firebase/firestore"; 

const RoomContext = createContext();

export const useRoom = () => useContext(RoomContext);

const initialRoom = {
  id: null,
  name: '',
  duration: 0,
  adminId: 'mock-admin-token',
  selfId: null,
  keys: {
    VOLUNTEER: '',
    ORGANIZER: '',
    DELEGATE: '',
    LOGISTICS_COORDINATOR: '',
    SPEAKER: ''
  },
  alerts: [], 
  messages: [],
  users: [],
  joinedRole: null
};

export const RoomProvider = ({ children }) => {
  const [roomState, setRoomState] = useState(() => {
    const saved = localStorage.getItem('eventGuardianState');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialRoom;
      }
    }
    return initialRoom;
  });

  const selfIdRef = useRef(null);

  useEffect(() => {
    const existing = localStorage.getItem('eventGuardianClientId');
    const newId = existing || (window.crypto?.randomUUID ? window.crypto.randomUUID() : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    if (!existing) localStorage.setItem('eventGuardianClientId', newId);
    selfIdRef.current = newId;
    
    setRoomState(prev => ({ ...prev, selfId: newId }));
  }, []);

  // Firestore real-time listener
  useEffect(() => {
    if (!roomState.id) return;

    console.log("Setting up Firestore listener for room:", roomState.id);
    const unsub = onSnapshot(doc(db, "events", roomState.id), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log("Firestore update received:", data);
        setRoomState(prev => ({
          ...prev,
          ...data,
          id: docSnapshot.id,
          selfId: prev.selfId || selfIdRef.current,
          joinedRole: prev.joinedRole
        }));
      } else {
        console.warn("Room document does not exist in Firestore!");
      }
    }, (error) => {
      console.error("Firestore listener error:", error);
    });

    return () => {
      console.log("Cleaning up Firestore listener");
      unsub();
    };
  }, [roomState.id]);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('eventGuardianState', JSON.stringify(roomState));
  }, [roomState]);

  const createRoom = async (name, duration) => {
    const roomId = Date.now().toString();
    const keys = { 
      VOLUNTEER: generateRoleKey('VOLUNTEER'), 
      ORGANIZER: generateRoleKey('ORGANIZER'),
      DELEGATE: generateRoleKey('DELEGATE'),
      LOGISTICS_COORDINATOR: generateRoleKey('LOGISTICS_COORDINATOR'),
      SPEAKER: generateRoleKey('SPEAKER')
    };

    const newRoomData = {
      name,
      duration,
      keys,
      adminId: 'mock-admin-token',
      alerts: [], 
      messages: [],
      users: [{ id: selfIdRef.current, role: 'ADMIN', location: null }],
      createdAt: Date.now()
    };

    try {
      await setDoc(doc(db, "events", roomId), newRoomData);
      setRoomState({
        ...newRoomData,
        id: roomId,
        selfId: selfIdRef.current,
        joinedRole: 'ADMIN'
      });
      return roomId;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  };

  const joinRoom = async (code) => {
    try {
      console.log("Attempting to join room with code:", code);
      const q = query(collection(db, "events"));
      const snapshot = await getDocs(q);
      
      console.log(`Found ${snapshot.size} total events in Firestore`);
      
      let foundRoom = null;
      let matchedRole = null;

      const upperCode = code.trim().toUpperCase();

      snapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        const docId = docSnapshot.id;
        
        console.log(`Checking room: ${docId} (${data.name})`);
        
        if (data.keys) {
          for (const [roleName, roleKey] of Object.entries(data.keys)) {
            const normalizedKey = roleKey.trim().toUpperCase();
            console.log(`  Comparing "${upperCode}" with "${normalizedKey}" (${roleName})`);
            
            if (upperCode === normalizedKey && roleKey) {
              foundRoom = { ...data, id: docId };
              matchedRole = roleName;
              console.log(`  MATCH FOUND! Room: ${docId}, Role: ${roleName}`);
              break;
            }
          }
        }
        
        if (!foundRoom && upperCode === 'MOCK-ADMIN-TOKEN') {
          foundRoom = { ...data, id: docId };
          matchedRole = 'ADMIN';
          console.log(`  ADMIN MATCH FOUND via mock token!`);
        }
      });

      if (foundRoom) {
        const newUser = { id: selfIdRef.current, role: matchedRole, location: null };
        
        // Only add if not already in the users list
        const userExists = (foundRoom.users || []).some(u => u.id === selfIdRef.current);
        if (!userExists) {
          console.log("Adding new user to room users list");
          await updateDoc(doc(db, "events", foundRoom.id), {
            users: arrayUnion(newUser)
          });
        } else {
          console.log("User already exists in room users list");
        }
        
        setRoomState({
          ...foundRoom,
          selfId: selfIdRef.current,
          joinedRole: matchedRole
        });
        return true;
      }
      
      console.error("No matching room found for code:", upperCode);
      throw new Error("Invalid room code");
    } catch (error) {
      console.error("Error joining room:", error);
      throw error;
    }
  };

  const sendAlert = async (alertOptions) => {
    if (!roomState.id) return;
    
    const newAlert = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...alertOptions,
      sender: roomState.joinedRole
    };

    try {
      await updateDoc(doc(db, "events", roomState.id), {
        alerts: arrayUnion(newAlert)
      });
      return newAlert;
    } catch (error) {
      console.error("Error sending alert:", error);
    }
  };

  const sendMessage = async (msgOptions) => {
    if (!roomState.id) return;

    const newMsg = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...msgOptions,
      sender: roomState.joinedRole
    };

    try {
      await updateDoc(doc(db, "events", roomState.id), {
        messages: arrayUnion(newMsg)
      });
      return newMsg;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const updateLocation = async (text) => {
    if (!roomState.id) return;

    try {
      const userId = selfIdRef.current || roomState.selfId;
      const updatedUsers = (roomState.users || []).map(u => 
        u.id === userId ? { ...u, location: text } : u
      );

      await updateDoc(doc(db, "events", roomState.id), {
        users: updatedUsers
      });
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const logout = () => {
    setRoomState(prev => ({ ...prev, joinedRole: null }));
  };

  return (
    <RoomContext.Provider value={{ roomState, createRoom, joinRoom, sendAlert, sendMessage, updateLocation, logout }}>
      {children}
    </RoomContext.Provider>
  );
};
