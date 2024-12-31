// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


//  Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwnJXW3Sn9tRuD5Obbcwv9AiiY9Z3R5ag",
  authDomain: "inventorymanagementsyste-6bd5a.firebaseapp.com",
  projectId: "inventorymanagementsyste-6bd5a",
  storageBucket: "inventorymanagementsyste-6bd5a.firebasestorage.app",
  messagingSenderId: "195358042601",
  appId: "1:195358042601:web:42a57decf58e5b655fc378"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };