import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { DrawingData, User, CursorData } from '../types/whiteboard';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const useSocket = (roomId: string, user: User | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [drawings, setDrawings] = useState<DrawingData[]>([]);

  useEffect(() => {
    if (!user || !roomId) {
      setSocket(null);
      setIsConnected(false);
      setUsers([]);
      setDrawings([]);
      return;
    }

    const newSocket = io('http://localhost:3001');

    const userDocRef = doc(db, 'rooms', roomId, 'users', user.id);

    newSocket.on('connect', async () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      newSocket.emit('joinRoom', roomId, user);

      // Add user to Firestore when connected
      await setDoc(userDocRef, { name: user.name, color: user.color, lastSeen: Date.now() });
    });

    newSocket.on('disconnect', async () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
      setUsers([]);
      setDrawings([]);

      // Remove user from Firestore when disconnected
      await deleteDoc(userDocRef);
    });

    newSocket.on('initialDrawings', (initialDrawings: DrawingData[]) => {
      setDrawings(initialDrawings);
    });

    newSocket.on('draw', (data: DrawingData) => {
      setDrawings(prev => [...prev, data]);
    });

    newSocket.on('clear', () => {
      setDrawings([]);
    });

    // Listen for real-time user updates from Firestore
    const usersCollectionRef = collection(db, 'rooms', roomId, 'users');
    const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
      const currentUsers: User[] = [];
      snapshot.forEach(doc => {
        const userData = doc.data();
        currentUsers.push({ id: doc.id, name: userData.name, color: userData.color });
      });
      setUsers(currentUsers);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      unsubscribe(); // Unsubscribe from Firestore listener
    };
  }, [roomId, user]);

  const emitDrawing = (drawingData: DrawingData) => {
    if (socket && isConnected && user) {
      socket.emit('draw', { ...drawingData, roomId });
      setDrawings(prev => [...prev, drawingData]); // Add to local state immediately
    }
  };

  const emitCursor = (cursorData: CursorData) => {
    if (socket && isConnected && user) {
      socket.emit('cursor', cursorData);
    }
  };

  const clearCanvas = () => {
    if (socket && isConnected && user) {
      socket.emit('clear', roomId);
    }
  };

  const emitUndo = (newDrawings: DrawingData[]) => {
    if (socket && isConnected && user) {
      socket.emit('undo', { roomId, drawings: newDrawings });
    }
  };

  const emitRedo = (newDrawings: DrawingData[]) => {
    if (socket && isConnected && user) {
      socket.emit('redo', { roomId, drawings: newDrawings });
    }
  };

  useEffect(() => {
    if (socket && user) {
      socket.on('draw', (drawingData: DrawingData) => {
        setDrawings(prev => [...prev, drawingData]);
      });

      socket.on('cursor', (cursorData: CursorData) => {
        if (cursorData.userId !== user.id) {
          setUsers(prev => prev.map(u => 
            u.id === cursorData.userId 
              ? { ...u, cursor: { x: cursorData.x, y: cursorData.y }, isDrawing: cursorData.isDrawing }
              : u
          ));
        }
      });

      socket.on('clear', () => {
        setDrawings([]);
      });

      socket.on('undo', (data: { drawings: DrawingData[] }) => {
        setDrawings(data.drawings);
      });

      socket.on('redo', (data: { drawings: DrawingData[] }) => {
        setDrawings(data.drawings);
      });
    }
  }, [socket, user]);

  return {
    socket,
    isConnected,
    users,
    drawings,
    emitDrawing,
    emitCursor,
    clearCanvas,
    emitUndo,
    emitRedo,
  };
};