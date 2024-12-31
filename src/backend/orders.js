import { fetchData, addData, updateData } from "./firebaseUtils";

const ORDERS_COLLECTION = "orders";

// Fetch all orders
export const getOrders = async () => {
  return await fetchData(ORDERS_COLLECTION);
};

// Add a new order
export const addOrder = async (orderData) => {
  return await addData(ORDERS_COLLECTION, orderData);
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus) => {
  return await updateData(ORDERS_COLLECTION, orderId, { status: newStatus });
};
