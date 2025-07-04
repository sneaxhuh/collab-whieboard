import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types/whiteboard';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUser: User;
  isOpen: boolean;
  onToggle: () => void;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, currentUser, isOpen, onToggle }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className={`fixed right-4 w-full max-w-xs bg-white rounded-xl shadow-xl flex flex-col z-20 border border-gray-200 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl`}
      style={{ bottom: isOpen ? 'calc(4rem + 16px)' : '4rem' }} // 4rem for buttons + 16px for spacing
    >
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
        <h3 className="text-lg font-bold text-gray-800">Room Chat</h3>
        <button onClick={onToggle} className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto max-h-80 custom-scrollbar">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`mb-3 flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                msg.senderId === currentUser.id 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                <div className="font-semibold text-xs mb-1 opacity-80">
                  {msg.senderId === currentUser.id ? 'You' : msg.senderName}
                </div>
                <p className="text-sm break-words">{msg.text}</p>
                <div className="text-right text-xs mt-1 opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-100 flex items-center bg-gray-50 rounded-b-xl">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleSend}
          className="ml-3 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
