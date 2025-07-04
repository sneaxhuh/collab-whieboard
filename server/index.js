const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

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

io.use(async (socket, next) => {
  const idToken = socket.handshake.auth.token;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    socket.decodedToken = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
  const userId = socket.decodedToken.uid;
  const userName = socket.decodedToken.name || socket.decodedToken.email || 'Anonymous';

  socket.on('joinRoom', async (roomId) => {
    socket.join(roomId);
    socket.roomId = roomId; // Store roomId on socket
    socket.userId = userId; // Store userId on socket
    console.log(`[joinRoom] User ${userName} (${userId}) joined room ${roomId}`);

    // Ensure the room document exists in Firestore and update user count
    const roomRef = db.collection('rooms').doc(roomId);
    try {
      const roomDoc = await roomRef.get();
      if (!roomDoc.exists) {
        console.log(`[joinRoom] Room ${roomId} does not exist. Creating...`);
        await roomRef.set({
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: userId,
          userCount: 1, // Initialize user count
        });
        console.log(`[joinRoom] Room ${roomId} successfully created in Firestore`);
      } else {
        console.log(`[joinRoom] Room ${roomId} already exists in Firestore. Incrementing user count.`);
        await roomRef.update({
          userCount: admin.firestore.FieldValue.increment(1),
        });
      }
    } catch (error) {
      console.error(`[joinRoom] Error checking/creating/updating room ${roomId} in Firestore:`, error);
    }

    // Send existing drawings from Firestore to the newly joined user
    const drawingsRef = roomRef.collection('drawings');
    const snapshot = await drawingsRef.orderBy('timestamp').get();
    const initialDrawings = snapshot.docs.map(doc => doc.data());
    socket.emit('initialDrawings', initialDrawings);
  });

  socket.on('draw', async (data) => {
    // Add drawing to Firestore
    const drawingsRef = db.collection('rooms').doc(data.roomId).collection('drawings');
    await drawingsRef.add({ ...data, userId });

    // Broadcast drawing to all clients in the room
    io.to(data.roomId).emit('draw', { ...data, userId });
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
    socket.to(data.roomId).emit('cursor', { ...data, userId });
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

  socket.on('chatMessage', (data) => {
    // Broadcast chat message to all clients in the room
    io.to(data.roomId).emit('chatMessage', data);
  });

  socket.on('disconnect', async () => {
    const { roomId, userId } = socket; // Retrieve roomId and userId from socket
    console.log(`[disconnect] User ${userId} disconnected from room ${roomId}`);

    if (roomId && userId) {
      const roomRef = db.collection('rooms').doc(roomId);
      const userDocRef = roomRef.collection('users').doc(userId);

      try {
        // Get the room document first to check its existence
        const roomDoc = await roomRef.get();

        if (roomDoc.exists) {
          // Decrement user count in room document
          console.log(`[disconnect] Attempting to decrement user count for room ${roomId}`);
          await roomRef.update({
            userCount: admin.firestore.FieldValue.increment(-1),
          });
          console.log(`[disconnect] Decremented user count for room ${roomId}`);

          // Delete user's presence document
          await userDocRef.delete();
          console.log(`[disconnect] Deleted user ${userId} from room ${roomId} presence`);

          // Check if user count is zero and delete room if so
          const currentUserCount = (await roomRef.get()).data().userCount; // Re-fetch to get latest count
          console.log(`[disconnect] Current user count for room ${roomId}: ${currentUserCount}`);
          if (currentUserCount <= 0) {
            console.log(`[disconnect] Room ${roomId} has no active users. Deleting room.`);
            
            // Delete all drawings subcollection
            const drawingsRef = roomRef.collection('drawings');
            const snapshot = await drawingsRef.get();
            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
              batch.delete(doc.ref);
            });
            if (snapshot.size > 0) {
              await batch.commit();
              console.log(`[disconnect] Deleted ${snapshot.size} drawings for room ${roomId}`);
            } else {
              console.log(`[disconnect] No drawings to delete for room ${roomId}`);
            }

            // Delete all users subcollection
            const usersRef = roomRef.collection('users');
            const usersSnapshot = await usersRef.get();
            const usersBatch = db.batch();
            usersSnapshot.docs.forEach((doc) => {
              usersBatch.delete(doc.ref);
            });
            if (usersSnapshot.size > 0) {
              await usersBatch.commit();
              console.log(`[disconnect] Deleted ${usersSnapshot.size} user presence documents for room ${roomId}`);
            } else {
              console.log(`[disconnect] No user presence documents to delete for room ${roomId}`);
            }

            // Finally, delete the room document itself
            await roomRef.delete();
            console.log(`[disconnect] Room ${roomId} deleted from Firestore`);
          } else {
            console.log(`[disconnect] Room ${roomId} still has active users (${currentUserCount}). Not deleting.`);
          }
        } else {
          console.log(`[disconnect] Room ${roomId} document does not exist. It might have been deleted by another user.`);
        }
      } catch (error) {
        console.error(`[disconnect] Error handling disconnect for room ${roomId}:`, error);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});