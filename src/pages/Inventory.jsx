import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import styled from "styled-components";
import ProductDetailsModal from "../components/ProductDetailsModal";

export async function fetchLowStockCount() {
  const db = getFirestore();
  try {
    const productsSnapshot = await getDocs(collection(db, "products"));
    const productsData = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return productsData.filter((product) => product.quantity <= product.reorderPoint).length;
  } catch (error) {
    console.error("Error fetching low stock count:", error);
    return 0;
  }
}

function Inventory() {
  const db = getFirestore();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const headers = ["Name", "SKU", "Price", "Quantity", "Reorder Point", "Status"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        productsData.sort((a, b) => a.quantity - b.quantity);
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [db]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductClick = (product) => setSelectedProduct(product);
  const handleCloseModal = () => setSelectedProduct(null);

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Inventory Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-8">
          Product Inventory
        </h1>
        <p className="text-white text-base">
           View and manage all your products at a glance. Use the
          search bar to quickly locate items by name and check important details such as stock levels,
          reorder points, and product status. Stay on top of low-stock items to ensure seamless
          operations.
        </p>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-auto border rounded-md px-4 py-2 text-sm sm:text-base focus:ring focus:ring-blue-500"
        />
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto bg-white shadow rounded-md">
        <StyledTable>
          <thead className="bg-blue-600 text-white">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-left"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <tr
                key={product.id}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td
                  className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm cursor-pointer text-blue-600 hover:underline"
                  onClick={() => handleProductClick(product)}
                >
                  {product.name}
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                  {product.sku}
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                  €{product.price.toFixed(2)}
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                  {product.quantity}
                </td>
                <td
                  className={`px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm ${
                    product.quantity <= product.reorderPoint
                      ? "text-red-600 font-bold"
                      : ""
                  }`}
                >
                  {product.reorderPoint}
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                  {product.quantity <= product.reorderPoint ? (
                    <span className="text-red-800">Low Stock</span>
                  ) : (
                    <span className="text-green-800">In Stock</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductDetailsModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
}

// Styled Table
const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.5rem;
    text-align: left;
  }
`;

export default Inventory;

