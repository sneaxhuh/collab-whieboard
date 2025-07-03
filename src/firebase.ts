import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALlXoBmPlHe06FvuKdD7DMIKfSBMp4zsI",
  authDomain: "collab-whiteboard-e68ad.firebaseapp.com",
  projectId: "collab-whiteboard-e68ad",
  storageBucket: "collab-whiteboard-e68ad.firebasestorage.app",
  messagingSenderId: "914784928596",
  appId: "1:914784928596:web:f79a291876f7acb6603ec1",
  measurementId: "G-Y6QQYEZL24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export const auth = getAuth(app);
