import { collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase-config";

// Reusable function to fetch data from Firestore
export const fetchData = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Add doc.id to the data
  } catch (error) {
    console.error(`Error fetching data from ${collectionName}:`, error);
    return [];  // Return an empty array in case of error
  }
};

// Add data to a Firestore collection
export const addData = async (collectionName, data) => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, data);
    return docRef.id; // Return the document ID after adding it
  } catch (error) {
    console.error("Error adding data:", error);
    throw error;
  }
};

// Update a Firestore document
export const updateData = async (collectionName, docId, newData) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, newData);
    return true;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};
