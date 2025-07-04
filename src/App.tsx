import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Settings, LogOut, MessageSquare } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { RoomManager } from './components/RoomManager';
import { AuthScreen } from './components/AuthScreen';
import { RoomSelectionScreen } from './components/RoomSelectionScreen';
import { Chat } from './components/Chat';
import { useSocket } from './hooks/useSocket';
import { DrawingTool, DrawingData, User, ChatMessage } from './types/whiteboard';
import { generateUserColor } from './utils/colors';
import { exportCanvasAsPNG, exportCanvasAsPDF } from './utils/export';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [roomSelected, setRoomSelected] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [tool, setTool] = useState<DrawingTool>('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillMode, setFillMode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const [undoStack, setUndoStack] = useState<DrawingData[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingData[][]>([]);
  const [showRoomManager, setShowRoomManager] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          id: user.uid,
          name: user.displayName || user.email || 'Anonymous',
          color: generateUserColor(user.uid),
        });
        // Check URL for room ID only after user is authenticated
        const params = new URLSearchParams(window.location.search);
        const urlRoomId = params.get('room');
        if (urlRoomId) {
          setRoomId(urlRoomId);
          setRoomSelected(true);
        }
      } else {
        setCurrentUser(null);
        setRoomSelected(false); // Reset room selection on logout
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);
  
  // Always call useSocket - it will handle null user internally
  const {
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
  } = useSocket(roomId, currentUser);

  const handleRoomSelection = useCallback(async (selectedRoomId: string) => {
    setRoomError(null);
    if (selectedRoomId) {
      // Check if room exists in Firestore
      const roomRef = doc(db, 'rooms', selectedRoomId);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        setRoomId(selectedRoomId);
        setRoomSelected(true);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('room', selectedRoomId);
        window.history.replaceState({}, '', newUrl);
      } else {
        setRoomError('Room does not exist. Please create a new room or enter a valid ID.');
      }
    } else {
      // Create new room
      const newRoomId = uuidv4();
      setRoomId(newRoomId);
      setRoomSelected(true);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('room', newRoomId);
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const handleLeaveRoom = useCallback(() => {
    setRoomId('');
    setRoomSelected(false);
    setUndoStack([]);
    setRedoStack([]);
    signOut(auth); // Sign out from Firebase
    
    // Clear URL params
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('room');
    window.history.replaceState({}, '', newUrl);
  }, []);

  const handleDrawing = useCallback((drawingData: DrawingData) => {
    // Save current state for undo
    setUndoStack(prev => [...prev, drawings]);
    setRedoStack([]); // Clear redo stack when new drawing is made
    
    emitDrawing(drawingData);
  }, [drawings, emitDrawing]);

  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, drawings]);
      setUndoStack(prev => prev.slice(0, -1));
      emitUndo(previousState);
    }
  }, [undoStack, drawings, emitUndo]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, drawings]);
      setRedoStack(prev => prev.slice(0, -1));
      emitRedo(nextState);
    }
  }, [redoStack, drawings, emitRedo]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const choice = window.confirm('Export as PDF? (Click Cancel for PNG)');
    if (choice) {
      exportCanvasAsPDF(canvas, `whiteboard-${roomId}.pdf`);
    } else {
      exportCanvasAsPNG(canvas, `whiteboard-${roomId}.png`);
    }
  }, [roomId]);

  const handleClear = useCallback(() => {
    setUndoStack(prev => [...prev, drawings]);
    setRedoStack([]);
    clearCanvas();
  }, [drawings, clearCanvas]);

  const handleSendMessage = useCallback((text: string) => {
    if (currentUser) {
      const message: ChatMessage = {
        id: uuidv4(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        text,
        timestamp: Date.now(),
      };
      emitMessage(message);
    }
  }, [currentUser, emitMessage]);

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  if (!roomSelected) {
    return <RoomSelectionScreen onJoinRoom={handleRoomSelection} roomError={roomError} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Room Manager Toggle */}
      <button
        onClick={() => setShowRoomManager(!showRoomManager)}
        className="fixed top-4 right-4 z-30 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
      >
        <Settings size={20} className="text-gray-600" />
      </button>

      {/* Logout Button */}
      <button
        onClick={handleLeaveRoom}
        className="fixed top-4 right-20 z-30 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        title="Logout"
      >
        <LogOut size={20} className="text-gray-600" />
      </button>

      {/* Chat Toggle */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed top-4 right-36 z-30 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        title="Toggle Chat"
      >
        <MessageSquare size={20} className="text-gray-600" />
      </button>

      

      {/* Room Manager */}
      <RoomManager
        roomId={roomId}
        users={users}
        onLeaveRoom={handleLeaveRoom}
        isOpen={showRoomManager}
        onToggle={() => setShowRoomManager(!showRoomManager)}
      />

      {/* Chat */}
      <Chat
        messages={messages}
        onSendMessage={handleSendMessage}
        currentUser={currentUser}
        isOpen={showChat}
        onToggle={() => setShowChat(!showChat)}
      />

      {/* Toolbar */}
      <Toolbar
        tool={tool}
        color={color}
        onColorChange={setColor}
        onToolChange={setTool}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        fillMode={fillMode}
        onFillModeChange={setFillMode}
        
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onSave={handleSave}
        userCount={users.length}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        
        
      />

      {/* Connection Status */}
      <div className="fixed bottom-4 left-4 z-10">
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Canvas */}
      <div className="pt-24 h-screen">
        <Canvas
          ref={canvasRef}
          tool={tool}
          color={color}
          strokeWidth={strokeWidth}
          drawings={drawings}
          users={users}
          currentUser={currentUser}
          onDrawing={handleDrawing}
          onCursor={emitCursor}
          fillMode={fillMode}
          
        />
      </div>
    </div>
  );
}

export default App;