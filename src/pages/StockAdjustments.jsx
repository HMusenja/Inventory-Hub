import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  Timestamp,  // Import Timestamp to add a proper timestamp to each adjustment
} from "firebase/firestore";

function StockAdjustments() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    adjustmentType: "add",
    reason: "",
  });

  // Error and Success States
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Initialize Firestore
  const db = getFirestore();

  // Fetch product data on component load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [db]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state
    setSuccessMessage(null); // Reset success state

    try {
      const { productId, quantity, adjustmentType, reason } = formData;

      if (!productId || !quantity || !reason) {
        setError("All fields are required.");
        return;
      }

      const productRef = doc(db, "products", productId);

      // Fetch the current product data
      const productSnapshot = await getDoc(productRef);
      if (!productSnapshot.exists()) {
        setError("Selected product does not exist.");
        return;
      }

      const productData = productSnapshot.data();
      const currentStock = productData.quantity;
      const productName = productData.name || "Unknown Product"; // Fallback if name is undefined

      // Calculate new stock based on adjustment type
      const adjustedQuantity = parseInt(quantity, 10);
      const newStock =
        adjustmentType === "add"
          ? currentStock + adjustedQuantity
          : currentStock - adjustedQuantity;

      if (newStock < 0) {
        setError("Stock cannot be negative.");
        return;
      }

      // Update product stock in Firestore
      await updateDoc(productRef, { quantity: newStock });

      // Log the stock adjustment to the `stockAdjustments` collection
      await addDoc(collection(db, "stockAdjustments"), {
        productId,
        productName,
        quantity: adjustedQuantity,
        adjustmentType,
        reason,
        date: Timestamp.now(), // Store the current time
      });

      // Success message
      const adjustmentAction =
        adjustmentType === "add" ? "added to" : "removed from";
      setSuccessMessage(
        `Stock for "${productName}" was ${adjustedQuantity} ${adjustmentAction} successfully. New stock: ${newStock}.`
      );

      // Reset form
      setFormData({
        productId: "",
        quantity: "",
        adjustmentType: "add",
        reason: "",
      });

      // Optional: Navigate to inventory page
      navigate("/inventory");
    } catch (error) {
      console.error("Error adjusting stock:", error);
      setError("An error occurred during stock adjustment. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Stock Adjustments</h1>

      <p className="text-white text-base mb-6">
       Adjust the stock levels of your products efficiently. Select a product, specify the adjustment type (addition or subtraction), and enter the adjustment quantity. Ensure the changes align with your inventory needs and confirm your updates before submitting. This helps maintain accurate stock records and ensures inventory accuracy.
      </p>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {successMessage && (
          <div className="text-green-700 bg-green-100 p-4 rounded-md border border-green-500">
            {successMessage}
          </div>
        )}

        {/* Select Product */}
        <div>
          <label
            htmlFor="productId"
            className="block text-sm font-medium text-gray-700 bg-green-100"
          >
            Select Product
          </label>
          <select
            id="productId"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (Current Stock: {product.quantity})
              </option>
            ))}
          </select>
        </div>

        {/* Adjustment Type */}
        <div>
          <label
            htmlFor="adjustmentType"
            className="block text-sm font-medium text-gray-700 bg-green-100"
          >
            Adjustment Type
          </label>
          <select
            id="adjustmentType"
            name="adjustmentType"
            value={formData.adjustmentType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="add">Add Stock</option>
            <option value="remove">Remove Stock</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 bg-green-100"
          >
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Reason */}
        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700 bg-green-100"
          >
            Reason
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-yellow-200"
            required
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Submit Adjustment
          </button>
        </div>
      </form>
    </div>
  );
}

export default StockAdjustments;
