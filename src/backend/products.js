import { db } from "./firebase-config";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  getDoc,
  getFirestore,
  query, orderBy ,
} from "firebase/firestore";


const PRODUCTS_COLLECTION = "products";

// Add a new product
export const addProduct = async (product) => {
  try {
    if (!product.sku) throw new Error("SKU is required.");
    const productRef = doc(db, PRODUCTS_COLLECTION, product.sku);
    await setDoc(productRef, {
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      reorderPoint: product.reorderPoint,
      sku: product.sku,
    });
    console.log("Product added successfully with SKU:", product.sku);
    return { id: product.sku, ...product };
  } catch (error) {
    console.error("Error adding product:", error.message);
    throw error;
  }
};

// Update an existing product
export const updateProduct = async (sku, updatedProductData) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, sku);
    const docSnapshot = await getDoc(productRef);
    if (!docSnapshot.exists()) {
      throw new Error(`Product with SKU ${sku} does not exist.`);
    }
    await updateDoc(productRef, updatedProductData);
    console.log("Product updated successfully with SKU:", sku);
  } catch (error) {
    console.error("Error updating product:", error.message);
    throw error;
  }
};


// Get all products with real-time updates, sorted by 'name'
export const getProducts = (callback) => {
  try {
    const productsCollection = collection(db, PRODUCTS_COLLECTION);
    const queryRef = query(productsCollection, orderBy("name")); // Sorting by 'name'

    const unsubscribe = onSnapshot(queryRef, (snapshot) => {
      const productsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(productsList);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return () => {};
  }
};



// Function to update the product quantity in Firestore
export const updateProductQuantity = async (productId, quantitySold) => {
  try {
    const db = getFirestore();
    const productRef = doc(db, 'products', productId);

    // Fetch the current product data
    const productSnapshot = await getDoc(productRef);
    const currentQuantity = productSnapshot.data().quantity;

    // Calculate the new quantity
    const newQuantity = currentQuantity - quantitySold;

    // Update the product quantity in Firestore
    await updateDoc(productRef, { quantity: newQuantity });
    console.log(`Product ${productId} quantity updated to ${newQuantity}`);
  } catch (error) {
    console.error('Error updating product quantity:', error);
  }
};

