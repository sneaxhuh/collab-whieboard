const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', async (roomId, user) => {
    socket.join(roomId);
    console.log(`User ${user.name} (${socket.id}) joined room ${roomId}`);

    // Send existing drawings from Firestore to the newly joined user
    const drawingsRef = db.collection('rooms').doc(roomId).collection('drawings');
    const snapshot = await drawingsRef.orderBy('timestamp').get();
    const initialDrawings = snapshot.docs.map(doc => doc.data());
    socket.emit('initialDrawings', initialDrawings);
  });

  socket.on('draw', async (data) => {
    // Add drawing to Firestore
    const drawingsRef = db.collection('rooms').doc(data.roomId).collection('drawings');
    await drawingsRef.add(data);

    // Broadcast drawing to all clients in the room
    io.to(data.roomId).emit('draw', data);
  });

  socket.on('clear', async (roomId) => {
    // Clear drawings from Firestore
    const drawingsRef = db.collection('rooms').doc(roomId).collection('drawings');
    const snapshot = await drawingsRef.get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Broadcast clear event to all clients in the room
    io.to(roomId).emit('clear');
  });

  socket.on('cursor', (data) => {
    // Broadcast cursor data to all clients in the room except the sender
    socket.to(data.roomId).emit('cursor', data);
  });

  socket.on('undo', async (data) => {
    // Update drawings in Firestore
    const drawingsRef = db.collection('rooms').doc(data.roomId).collection('drawings');
    const snapshot = await drawingsRef.get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    for (const drawing of data.drawings) {
      await drawingsRef.add(drawing);
    }

    // Broadcast undo event to all clients in the room
    io.to(data.roomId).emit('undo', { drawings: data.drawings });
  });

  socket.on('redo', async (data) => {
    // Update drawings in Firestore
    const drawingsRef = db.collection('rooms').doc(data.roomId).collection('drawings');
    const snapshot = await drawingsRef.get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    for (const drawing of data.drawings) {
      await drawingsRef.add(drawing);
    }

    // Broadcast redo event to all clients in the room
    io.to(data.roomId).emit('redo', { drawings: data.drawings });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});