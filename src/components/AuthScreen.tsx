import React from 'react';
import { auth } from '../firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (err: Error) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Sign in to Collaborative Whiteboard
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};