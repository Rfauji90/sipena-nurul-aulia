import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-eJz9fDcnpEe-8hys0gGX_oJDZRfeCV0",
  authDomain: "sipena2-37cd1.firebaseapp.com",
  projectId: "sipena2-37cd1",
  storageBucket: "sipena2-37cd1.firebasestorage.app",
  messagingSenderId: "8214447330",
  appId: "1:8214447330:web:fd3b5f443f216855c2cabb",
  measurementId: "G-K2LSJY976J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
