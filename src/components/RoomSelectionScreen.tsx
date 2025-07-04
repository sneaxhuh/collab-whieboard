import React, { useState } from 'react';

interface RoomSelectionScreenProps {
  onJoinRoom: (roomId: string) => void;
  roomError?: string | null;
}

export const RoomSelectionScreen: React.FC<RoomSelectionScreenProps> = ({
  onJoinRoom,
  roomError,
}) => {
  const [roomIdInput, setRoomIdInput] = useState('');

  const handleJoinExistingRoom = () => {
    if (roomIdInput.trim()) {
      onJoinRoom(roomIdInput.trim());
    }
  };

  const handleCreateNewRoom = () => {
    onJoinRoom('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">Join or Create Room</h2>

        {roomError && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm text-center">
            {roomError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="roomId"
              className="block text-sm font-medium text-gray-700"
            >
              Room ID
            </label>
            <input
              type="text"
              id="roomId"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              placeholder="Enter Room ID"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleJoinExistingRoom}
              className="mt-3 w-full flex justify-center items-center py-2 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Join Room
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute w-full border-t border-gray-300"></div>
            <span className="bg-white px-3 text-gray-500 z-10 text-sm">OR</span>
          </div>

          <button
            onClick={handleCreateNewRoom}
            className="w-full flex justify-center items-center py-2 px-4 rounded-lg text-sm font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          >
            Create New Room
          </button>
        </div>
      </div>
    </div>
  );
};
