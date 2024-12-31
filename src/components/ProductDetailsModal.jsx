import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";

function ProductDetailsModal({ product, onClose }) {
  const db = getFirestore();
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product && product.id) {
      const fetchProductDetails = async () => {
        setLoading(true);
        setError("");
        try {
          const productRef = doc(db, "products", product.id); // Ensure product.id exists
          const productSnapshot = await getDoc(productRef);
          if (productSnapshot.exists()) {
            setProductDetails({
              id: productSnapshot.id,
              ...productSnapshot.data(),
            });
          } else {
            setError("Product not found in Firestore.");
          }
        } catch (err) {
          console.error("Error fetching product details:", err);
          setError("Failed to fetch product details. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchProductDetails();
    } else {
      setError("Invalid product data.");
      setLoading(false);
    }
  }, [product, db]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div>
            <h2 className="text-lg font-bold mb-4">{productDetails.name}</h2>
            <p>
              <strong>SKU:</strong> {productDetails.sku}
            </p>
            <p>
              <strong>Price:</strong> €{productDetails.price.toFixed(2)}
            </p>
            <p>
              <strong>Quantity Left:</strong> {productDetails.quantity}
            </p>
            <p>
  <strong>Reorder Point:</strong>{" "}
  <span
    style={{
      color: productDetails.quantity <= productDetails.reorderPoint ? "red" : "inherit",
      fontWeight: productDetails.quantity <= productDetails.reorderPoint ? "bold" : "normal",
    }}
  >
    {productDetails.reorderPoint}
  </span>
</p>


            {/* <p><strong>Total Sold:</strong> {productDetails.totalSold || "N/A"}</p>
            <p><strong>Last Sold:</strong> {productDetails.lastSold || "N/A"}</p>
            <p><strong>Last Refilled:</strong> {productDetails.lastRefilled || "N/A"}</p>*/}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailsModal;
