import React, { useState, useEffect } from "react";
import { addProduct, updateProduct } from "../backend/products"; // Assuming these are the backend functions

function ProductsPage({ products, onAddProduct, onUpdateProduct }) {
  const [formData, setFormData] = useState({
    id: "",  // For updating existing products
    name: "",
    sku: "",
    price: "",
    quantity: "",
    reorderPoint: "",
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission for adding or updating product
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { id, name, sku, price, quantity, reorderPoint } = formData;

    if (id) {
      // If there's an ID, update the product
      await onUpdateProduct(id, { name, sku, price, quantity, reorderPoint });
    } else {
      // Otherwise, add a new product
      await onAddProduct({ name, sku, price, quantity, reorderPoint });
    }

    // Reset the form after submission
    setFormData({
      id: "",
      name: "",
      sku: "",
      price: "",
      quantity: "",
      reorderPoint: "",
    });
  };

  // Set the form data when selecting a product to update
  const handleEditProduct = (product) => {
    setFormData({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
      reorderPoint: product.reorderPoint,
    });
  };

  return (
    <div>
      <h1>Products</h1>

      {/* Form for adding or updating a product */}
      <form onSubmit={handleFormSubmit}>
        <h2>{formData.id ? "Update Product" : "Add Product"}</h2>

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="sku"
          placeholder="SKU"
          value={formData.sku}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="reorderPoint"
          placeholder="Reorder Point"
          value={formData.reorderPoint}
          onChange={handleInputChange}
          required
        />

        <button type="submit">{formData.id ? "Update Product" : "Add Product"}</button>
      </form>

      {/* Display the list of products */}
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} (Stock: {product.quantity})
            <button onClick={() => handleEditProduct(product)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductsPage;
