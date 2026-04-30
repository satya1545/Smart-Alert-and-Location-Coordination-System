const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store room states in memory for this demo
// In a production app, use a database (Redis/MongoDB/Postgres)
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  function getRoom(roomId) {
    return rooms.get(roomId);
  }

  function setRoom(roomId, state) {
    rooms.set(roomId, state);
    io.to(roomId).emit('room-update', state);
  }

  socket.on('create-room', (payload, ack) => {
    try {
      const { roomId, state } = payload || {};
      if (!roomId || !state || typeof state !== 'object') {
        const res = { ok: false, error: 'Invalid create-room payload' };
        if (typeof ack === 'function') return ack(res);
        return;
      }

      rooms.set(roomId, { ...state, id: roomId });
      socket.join(roomId);
      const res = { ok: true, roomId, state: rooms.get(roomId), role: state.joinedRole || 'ADMIN' };
      if (typeof ack === 'function') return ack(res);
      socket.emit('room-update', rooms.get(roomId));
    } catch (e) {
      const res = { ok: false, error: 'Failed to create room' };
      if (typeof ack === 'function') return ack(res);
    }
  });

  socket.on('join-by-code', (payload, ack) => {
    const code = typeof payload === 'string' ? payload : payload?.code;
    const userId = typeof payload === 'object' ? payload?.userId : null;
    console.log(`User ${socket.id} trying to join with code: ${code}`);
    
    // Find room where one of the keys matches the code
    let foundRoomId = null;
    let matchedRole = null;
    let foundState = null;

    for (const [roomId, state] of rooms.entries()) {
      // Check for role-based keys
      for (const [roleName, roleKey] of Object.entries(state.keys)) {
        if (code === roleKey && roleKey) {
          foundRoomId = roomId;
          matchedRole = roleName;
          foundState = state;
          break;
        }
      }
      if (foundRoomId) break;
      
      // Check for admin token
      if (code === 'mock-admin-token' && state.id) {
          foundRoomId = roomId;
          matchedRole = 'ADMIN';
          foundState = state;
          break;
      }
    }

    if (foundRoomId) {
      socket.join(foundRoomId);
      console.log(`User ${socket.id} joined room ${foundRoomId} as ${matchedRole}`);
      
      // Update users list in state
      const newUser = { id: userId || ('user-' + Date.now()), role: matchedRole, location: null };
      const withoutDup = (foundState.users || []).filter(u => u.id !== newUser.id);
      const updatedState = {
        ...foundState,
        users: [...withoutDup, newUser]
      };
      
      rooms.set(foundRoomId, updatedState);
      
      const res = { ok: true, roomId: foundRoomId, role: matchedRole, state: updatedState };
      if (typeof ack === 'function') return ack(res);
      // Send the state back to the user who joined (legacy)
      socket.emit('join-success', res);
      
      // Notify everyone else in the room
      socket.to(foundRoomId).emit('room-update', updatedState);
    } else {
      const res = { ok: false, error: 'Invalid room code' };
      if (typeof ack === 'function') return ack(res);
      socket.emit('join-error', res.error);
    }
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    
    // Send current room state if it exists
    if (rooms.has(roomId)) {
      socket.emit('room-update', rooms.get(roomId));
    }
  });

  socket.on('update-room', ({ roomId, newState }) => {
    console.log(`Updating room ${roomId}`);
    rooms.set(roomId, newState);
    // Broadcast to everyone in the room except the sender
    socket.to(roomId).emit('room-update', newState);
  });

  socket.on('send-message', ({ roomId, message }, ack) => {
    try {
      const state = getRoom(roomId);
      if (!state) return typeof ack === 'function' ? ack({ ok: false, error: 'Room not found' }) : undefined;
      if (!message) return typeof ack === 'function' ? ack({ ok: false, error: 'Invalid message' }) : undefined;

      const next = {
        ...state,
        messages: [...(state.messages || []), message]
      };
      setRoom(roomId, next);
      if (typeof ack === 'function') ack({ ok: true });
    } catch (e) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Failed to send message' });
    }
  });

  socket.on('send-alert', ({ roomId, alert }, ack) => {
    try {
      const state = getRoom(roomId);
      if (!state) return typeof ack === 'function' ? ack({ ok: false, error: 'Room not found' }) : undefined;
      if (!alert) return typeof ack === 'function' ? ack({ ok: false, error: 'Invalid alert' }) : undefined;

      const next = {
        ...state,
        alerts: [...(state.alerts || []), alert]
      };
      setRoom(roomId, next);
      if (typeof ack === 'function') ack({ ok: true });
    } catch (e) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Failed to send alert' });
    }
  });

  socket.on('update-location', ({ roomId, userId, location }, ack) => {
    try {
      const state = getRoom(roomId);
      if (!state) return typeof ack === 'function' ? ack({ ok: false, error: 'Room not found' }) : undefined;
      if (!userId) return typeof ack === 'function' ? ack({ ok: false, error: 'Invalid userId' }) : undefined;

      const users = (state.users || []).map(u => (u.id === userId ? { ...u, location } : u));
      const next = { ...state, users };
      setRoom(roomId, next);
      if (typeof ack === 'function') ack({ ok: true });
    } catch (e) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Failed to update location' });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
