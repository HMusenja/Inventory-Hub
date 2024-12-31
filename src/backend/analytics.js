import { fetchData } from "./firebaseUtils";

const ORDERS_COLLECTION = "orders";

// Get total sales
export const getTotalSales = async () => {
    const orders = await fetchData("orders");  // Fetch all orders
    // Ensure that `orders` is a valid array
    if (!Array.isArray(orders)) {
      console.error("Orders data is invalid:", orders);
      return 0;  // Return 0 if data is invalid
    }
  
    return orders.reduce((total, order) => {
      // Ensure each order has the totalPrice field and it's a valid number
      const totalPrice = typeof order.totalPrice === "number" ? order.totalPrice : 0;
      return total + totalPrice;
    }, 0);
  };
// Get top-selling products
export const getTopSellingProducts = async () => {
    const orders = await fetchData("orders");  // Fetch all orders
    const productSales = {};
  
    if (!Array.isArray(orders)) {
      console.error("Orders data is invalid:", orders);
      return [];  // Return empty array if data is invalid
    }
  
    orders.forEach(order => {
      // Ensure that `order.productIds` is an array and exists
      if (Array.isArray(order.productIds)) {
        order.productIds.forEach(productId => {
          // Ensure productId is valid (not null, undefined, etc.)
          if (productId) {
            productSales[productId] = (productSales[productId] || 0) + 1;
          }
        });
      }
    });
  
    // Sort products by sales count (descending order)
    return Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)  // Sort by sales count
      .map(([productId, sales]) => ({ productId, sales }));
  };
  