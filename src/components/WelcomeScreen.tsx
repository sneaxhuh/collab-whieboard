import React, { useState } from 'react';
import { Paintbrush, Users, Zap, Shield, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface WelcomeScreenProps {
  onJoinRoom: (roomId: string, userName: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onJoinRoom }) => {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    if (!userName.trim()) return;
    
    setIsJoining(true);
    try {
      const roomRef = doc(db, 'rooms', uuidv4()); // Let Firestore generate ID
      await setDoc(roomRef, { createdAt: new Date() });
      onJoinRoom(roomRef.id, userName.trim());
    } catch (error) {
      console.error('Error creating room:', error);
      setIsJoining(false);
      alert('Failed to create room. Please try again.');
    }
  };

  const handleJoinRoom = async () => {
    if (!userName.trim() || !roomId.trim()) return;
    
    setIsJoining(true);
    try {
      const roomRef = doc(db, 'rooms', roomId.trim());
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        onJoinRoom(roomId.trim(), userName.trim());
      } else {
        alert('Room does not exist.');
        setIsJoining(false);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      setIsJoining(false);
      alert('Failed to join room. Please try again.');
    }
  };

  // Check if there's a room ID in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl) {
      setRoomId(roomFromUrl);
      // Optionally, if you want to auto-join if a username is also present
      // if (userName.trim()) {
      //   setIsJoining(true);
      //   onJoinRoom(roomFromUrl, userName.trim());
      // }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <Paintbrush size={48} className="text-blue-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Collaborative Whiteboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Draw, create, and collaborate in real-time with your team. 
            Experience the power of seamless visual collaboration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Create Room */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Users size={24} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Room</h2>
              <p className="text-gray-600">Start a new collaborative session</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                  disabled={isJoining}
                />
              </div>
              
              <button
                onClick={handleCreateRoom}
                disabled={!userName.trim() || isJoining}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isJoining ? 'Creating Room...' : 'Create Room'}
              </button>
            </div>
          </div>

          {/* Join Room */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Zap size={24} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Existing Room</h2>
              <p className="text-gray-600">Join a room with an invitation code</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your name"
                  disabled={isJoining}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room ID
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter room ID"
                  disabled={isJoining}
                />
              </div>
              
              <button
                onClick={handleJoinRoom}
                disabled={!userName.trim() || !roomId.trim() || isJoining}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isJoining ? 'Joining Room...' : 'Join Room'}
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
            <Shield size={32} className="text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Secure Collaboration</h3>
            <p className="text-sm text-gray-600">Private rooms with secure real-time sync</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
            <Zap size={32} className="text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Drawing</h3>
            <p className="text-sm text-gray-600">See changes instantly as others draw</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
            <Download size={32} className="text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Save & Export</h3>
            <p className="text-sm text-gray-600">Download your creations as images</p>
          </div>
        </div>
      </div>
    </div>
  );
};