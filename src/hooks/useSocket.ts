import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { DrawingData, User, CursorData, ChatMessage } from '../types/whiteboard';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

export const useSocket = (roomId: string, user: User | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [drawings, setDrawings] = useState<DrawingData[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log('[useSocket useEffect] Triggered with roomId:', roomId, 'user:', user);

    if (!user || !roomId) {
      if (socketRef.current) {
        console.log('[useSocket useEffect] Disconnecting existing socket due to missing user or roomId.');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
      setUsers([]);
      setDrawings([]);
      setMessages([]);
      return;
    }

    if (socketRef.current && socketRef.current.connected && socketRef.current.io.opts.query?.roomId === roomId) {
      console.log('[useSocket useEffect] Socket already connected to the correct room. Skipping reconnection.');
      return;
    }

    const connectSocket = async () => {
      console.log('[useSocket] Attempting to connect socket...');
      const idToken = await auth.currentUser?.getIdToken();
      const newSocket = io('http://localhost:3001', {
        auth: {
          token: idToken,
        },
        query: {
          roomId: roomId,
        },
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      const userDocRef = doc(db, 'rooms', roomId, 'users', user.id);

      newSocket.on('connect', async () => {
        console.log('[useSocket] Connected to socket server');
        setIsConnected(true);
        newSocket.emit('joinRoom', roomId);

        await setDoc(userDocRef, { name: user.name, color: user.color, lastSeen: Date.now() });
      });

      newSocket.on('disconnect', async () => {
        console.log('[useSocket] Disconnected from socket server');
        setIsConnected(false);
        setDrawings([]);
        setMessages([]);

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

      newSocket.on('chatMessage', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
      });

      const usersCollectionRef = collection(db, 'rooms', roomId, 'users');
      const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
        const currentUsers: User[] = [];
        snapshot.forEach(doc => {
          const userData = doc.data();
          currentUsers.push({ id: doc.id, name: userData.name, color: userData.color });
        });
        setUsers(currentUsers);
      });

      return () => {
        console.log('[useSocket useEffect cleanup] Disconnecting socket and unsubscribing Firestore listener.');
        newSocket.disconnect();
        unsubscribe();
        socketRef.current = null;
      };
    };

    connectSocket();

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

  const emitMessage = (message: ChatMessage) => {
    if (socket && isConnected && user) {
      socket.emit('chatMessage', { ...message, roomId });
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
    messages,
    emitDrawing,
    emitCursor,
    clearCanvas,
    emitUndo,
    emitRedo,
    emitMessage,
  };
};