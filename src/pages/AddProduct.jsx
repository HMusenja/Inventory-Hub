import { useState, useEffect } from "react";
import { getProducts, addProduct, updateProduct } from "../backend/products";

function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    quantity: "",
    reorderPoint: "",
  });

  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products from Firestore, sorted by name
  useEffect(() => {
    const unsubscribe = getProducts((data) => {
      setProducts(data);
    });
    return () => unsubscribe();
  }, []);

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Product name is required.";
    if (!formData.sku) newErrors.sku = "SKU is required.";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Price must be greater than zero.";
    if (!formData.quantity || formData.quantity < 0)
      newErrors.quantity = "Quantity cannot be negative.";
    if (!formData.reorderPoint || formData.reorderPoint < 0)
      newErrors.reorderPoint = "Reorder point cannot be negative.";

    if (
      !editMode &&
      products.some((product) => product.sku === formData.sku)
    ) {
      newErrors.sku = "SKU must be unique.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle product editing
  const handleEdit = (product) => {
    setEditMode(true);
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      reorderPoint: product.reorderPoint.toString(),
    });
  };

  // Reset form after adding/updating a product
  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      price: "",
      quantity: "",
      reorderPoint: "",
    });
    setEditMode(false);
    setSelectedProduct(null);
    setErrors({});
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const updatedProductData = {
        name: formData.name,
        sku: formData.sku,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        reorderPoint: parseInt(formData.reorderPoint, 10),
      };

      if (editMode) {
        await updateProduct(formData.sku, updatedProductData);
        console.log("Product updated successfully!");
      } else {
        const newProduct = { ...updatedProductData, lastOrdered: new Date().toISOString() };
        await addProduct(newProduct);
        console.log("Product added successfully!");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving product:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4 sm:px-6 md:px-8">
      <h1 className="text-2xl font-bold text-white mb-6">
        {editMode ? "Edit Product" : "Add New Product"}
      </h1>
<p className="text-white text-base">Welcome to the Product Management Dashboard. Here, you can add new products to your inventory or update existing product details. Fill out the form below with the product's name, SKU, price, quantity, and reorder point. Use the product list at the bottom to quickly edit an item if needed. Ensure all required fields are completed, and SKUs are unique before submitting.</p>
      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6 bg-blue-50 rounded-lg shadow-md"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Product Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : ""
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="sku"
            className="block text-sm font-medium text-gray-700"
          >
            SKU
          </label>
          <input
            type="text"
            name="sku"
            id="sku"
            value={formData.sku}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.sku ? "border-red-500" : ""
            }`}
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Price
          </label>
          <input
            type="number"
            name="price"
            id="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.price ? "border-red-500" : ""
            }`}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700"
          >
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            id="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.quantity ? "border-red-500" : ""
            }`}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="reorderPoint"
            className="block text-sm font-medium text-gray-700"
          >
            Reorder Point
          </label>
          <input
            type="number"
            name="reorderPoint"
            id="reorderPoint"
            value={formData.reorderPoint}
            onChange={handleChange}
            min="0"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.reorderPoint ? "border-red-500" : ""
            }`}
          />
          {errors.reorderPoint && (
            <p className="mt-1 text-sm text-red-600">{errors.reorderPoint}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:bg-blue-400"
        >
          {isSubmitting ? "Saving..." : editMode ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* Product List Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Product List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white border rounded-lg">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-4 py-2 sm:px-6 sm:py-4 text-sm font-bold">Name</th>
                <th className="px-4 py-2 sm:px-6 sm:py-4 text-sm font-semibold">SKU</th>
                <th className="px-4 py-2 sm:px-6 sm:py-4 text-sm font-semibold">Price</th>
                <th className="px-4 py-2 sm:px-6 sm:py-4 text-sm font-semibold">Quantity</th>
                <th className="px-4 py-2 sm:px-6 sm:py-4 text-sm font-semibold">Reorder Point</th>
                <th className="px-4 py-2 sm:px-6 sm:py-4 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.sku}
                  className={`border-b hover:bg-gray-50 ${
                    product.lastOrdered ? "bg-yellow-100" : ""
                  }`}
                >
                  <td className="px-4 py-2 sm:px-6 sm:py-4 font-bold">{product.name}</td>
                  <td className="px-4 py-2 sm:px-6 sm:py-4 text-sm">{product.sku}</td>
                  <td className="px-4 py-2 sm:px-6 sm:py-4 text-sm">€{parseFloat(product.price).toFixed(2)}</td>
                  <td className="px-4 py-2 sm:px-6 sm:py-4 text-sm">{product.quantity}</td>
                  <td className="px-4 py-2 sm:px-6 sm:py-4 text-sm">{product.reorderPoint}</td>
                  <td className="px-4 py-2 sm:px-6 sm:py-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
