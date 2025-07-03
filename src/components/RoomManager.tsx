import React, { useState } from 'react';
import { Share2, X } from 'lucide-react';
import { User } from '../types/whiteboard';

interface RoomManagerProps {
  roomId: string;
  users: User[];
  onLeaveRoom: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const RoomManager: React.FC<RoomManagerProps> = ({
  roomId,
  users,
  onLeaveRoom,
  isOpen,
  onToggle,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyRoomLink = async () => {
    try {
      const url = `${window.location.origin}?room=${roomId}`;
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy room link:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 z-20 w-80">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Room Settings</h3>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Room ID */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room ID
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={roomId}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button
              onClick={copyRoomLink}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                copySuccess
                  ? 'bg-green-100 text-green-600'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {copySuccess ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Active Users ({users.length})
          </label>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-sm text-gray-900">{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share Button */}
        <div className="mb-4">
          <button
            onClick={copyRoomLink}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Share2 size={16} />
            <span>Share Room</span>
          </button>
        </div>

        {/* Leave Room */}
        <button
          onClick={onLeaveRoom}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
};