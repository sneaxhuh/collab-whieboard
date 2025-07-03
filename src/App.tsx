import React, { useState, useRef, useCallback } from 'react';
import { Settings } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { RoomManager } from './components/RoomManager';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useSocket } from './hooks/useSocket';
import { DrawingTool, DrawingData, User } from './types/whiteboard';
import { generateUserColor, getRandomUserName } from './utils/colors';
import { exportCanvasAsPNG, exportCanvasAsPDF } from './utils/export';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || '';
  });
  const [tool, setTool] = useState<DrawingTool>('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillMode, setFillMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [undoStack, setUndoStack] = useState<DrawingData[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingData[][]>([]);
  const [showRoomManager, setShowRoomManager] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Always call useSocket - it will handle null user internally
  const {
    socket,
    isConnected,
    users,
    drawings,
    emitDrawing,
    emitCursor,
    clearCanvas,
  } = useSocket(roomId, currentUser);

  const handleJoinRoom = useCallback((id: string, userName: string) => {
    const user: User = {
      id: uuidv4(),
      name: userName,
      color: generateUserColor(userName),
    };
    
    setCurrentUser(user);
    setRoomId(id);
    
    // Update URL without page reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('room', id);
    window.history.replaceState({}, '', newUrl);
  }, []);

  const handleLeaveRoom = useCallback(() => {
    setCurrentUser(null);
    setRoomId('');
    setUndoStack([]);
    setRedoStack([]);
    
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
      // In a real app, you'd emit this to other users
      console.log('Undo to state:', previousState);
    }
  }, [undoStack, drawings]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, drawings]);
      setRedoStack(prev => prev.slice(0, -1));
      // In a real app, you'd emit this to other users
      console.log('Redo to state:', nextState);
    }
  }, [redoStack, drawings]);

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
    if (window.confirm('Are you sure you want to clear the entire canvas?')) {
      setUndoStack(prev => [...prev, drawings]);
      setRedoStack([]);
      clearCanvas();
    }
  }, [drawings, clearCanvas]);

  // If no user is logged in, show welcome screen
  if (!currentUser) {
    return <WelcomeScreen onJoinRoom={handleJoinRoom} />;
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

      {/* Room Manager */}
      <RoomManager
        roomId={roomId}
        users={users}
        onLeaveRoom={handleLeaveRoom}
        isOpen={showRoomManager}
        onToggle={() => setShowRoomManager(!showRoomManager)}
      />

      {/* Toolbar */}
      <Toolbar
        tool={tool}
        onToolChange={setTool}
        color={color}
        onColorChange={setColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        fillMode={fillMode}
        onFillModeChange={setFillMode}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
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
          fontSize={fontSize}
        />
      </div>
    </div>
  );
}

export default App;