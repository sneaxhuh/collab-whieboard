import React, { useState } from 'react';

interface RoomSelectionScreenProps {
  onJoinRoom: (roomId: string) => void;
  roomError?: string | null;
}

export const RoomSelectionScreen: React.FC<RoomSelectionScreenProps> = ({ onJoinRoom, roomError }) => {
  const [roomIdInput, setRoomIdInput] = useState('');

  const handleJoinExistingRoom = () => {
    if (roomIdInput.trim()) {
      onJoinRoom(roomIdInput.trim());
    }
  };

  const handleCreateNewRoom = () => {
    onJoinRoom(''); // Pass empty string to signal new room creation
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Choose a Room</h2>
        {roomError && <p className="text-red-500 text-center mb-4">{roomError}</p>}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">Join Existing Room</label>
            <input
              type="text"
              id="roomId"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              placeholder="Enter Room ID"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleJoinExistingRoom}
              className="mt-3 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Join Room
            </button>
          </div>

          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">OR</span>
          </div>

          <button
            onClick={handleCreateNewRoom}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Room
          </button>
        </div>
      </div>
    </div>
  );
};