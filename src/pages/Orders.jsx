import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiTrash } from 'react-icons/fi';
import { getFirestore, collection, getDocs, addDoc, updateDoc, where,doc, deleteDoc,query} from 'firebase/firestore';

// Styled-components for the table
const TableContainer = styled.div`
  overflow-x-auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;

  thead {
    background-color: #f9fafb;
  }

  th {
    padding: 12px;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #4b5563;
    border-bottom: 1px solid #e5e7eb;
  }

  tbody tr:nth-child(odd) {
    background-color: #f3f4f6;
  }

  tbody tr:nth-child(even) {
    background-color: #ffffff;
  }

  td {
    padding: 12px;
    font-size: 0.875rem;
    color: #4b5563;
    border-bottom: 1px solid #e5e7eb;

    &.status-pending {
      background-color: #fef3c7;
      color: #92400e;
    }

    &.status-fulfilled {
      background-color: #d1fae5;
      color: #065f46;
    }
  }

  td.actions button {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #2563eb;
    }

    &.remove {
      background-color: #ef4444;

      &:hover {
        background-color: #b91c1c;
      }
    }
  }

  /* For small screens */
  @media (max-width: 768px) {
    display: block;
    width: 100%;

    thead {
      display: none; /* Hide header on small screens */
    }

    tbody {
      display: block;
      width: 100%;
    }

    tr {
      display: block;
      margin-bottom: 1.5rem;
      border: 1px solid #e5e7eb;
      padding: 1rem;
      border-radius: 8px;
    }

    td {
      display: block;
      text-align: right;
      position: relative;
      padding-left: 50%;
      border-bottom: none;
      padding-top: 10px;

      &::before {
        content: attr(data-label);
        position: absolute;
        left: 10px;
        top: 10px;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 0.875rem;
        color: #4b5563;
      }
    }

    td.actions {
      text-align: left;
      padding-top: 10px;
    }

    td.actions button {
      width: 100%;
      margin-top: 0.5rem;
    }
  }
`;

function Orders() {
  const db = getFirestore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrder, setNewOrder] = useState({
    customer: '',
    products: [], // Changed to store an array of products and quantities
    total: 0,
    status: 'pending',
  });
  const [productList, setProductList] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductList(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchOrders();
    fetchProducts();
  }, [db]);

  const headers = ['Order ID', 'Date', 'Customer', 'Product Names', 'Total', 'Status', 'Actions'];

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  const handleAddOrder = async (e) => {
    e.preventDefault();

    const total = newOrder.products.reduce((sum, item) => {
      const product = productList.find(p => p.name === item.name);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const newOrderData = {
      customer: newOrder.customer,
      productNames: newOrder.products.map(item => item.name),
      total: total.toFixed(2),
      status: newOrder.status,
      date: new Date().toISOString(),
    };

    try {
      const orderRef = await addDoc(collection(db, 'orders'), newOrderData);

      setOrders([
        ...orders,
        { id: orderRef.id, ...newOrderData },
      ]);

      setNewOrder({
        customer: '',
        products: [],
        total: 0,
        status: 'pending',
      });
    } catch (error) {
      console.error('Error adding new order:', error);
    }
  };

  const handleProductQuantityChange = (name, quantity) => {
    // Update the product quantity and recalculate the total price
    const updatedProducts = newOrder.products.map((product) =>
      product.name === name ? { ...product, quantity: Number(quantity) } : product
    );

    const updatedTotal = updatedProducts.reduce((sum, item) => {
      const product = productList.find(p => p.name === item.name);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    setNewOrder({
      ...newOrder,
      products: updatedProducts,
      total: updatedTotal.toFixed(2),
    });
  };

  const handleAddItemToOrder = (productName, quantity) => {
    const product = productList.find(p => p.name === productName);
    if (product) {
      const updatedProducts = [
        ...newOrder.products,
        { name: product.name, quantity: Number(quantity) }
      ];

      const updatedTotal = updatedProducts.reduce((sum, item) => {
        const product = productList.find(p => p.name === item.name);
        return sum + (product ? product.price * item.quantity : 0);
      }, 0);

      setNewOrder({ ...newOrder, products: updatedProducts, total: updatedTotal.toFixed(2) });
    }
  };

 // Handle order fulfillment
const handleMarkAsFulfilled = async (orderId) => {
  try {
    const order = orders.find((order) => order.id === orderId);
    if (!order || !Array.isArray(order.productNames)) {
      console.error(`Order ${orderId} does not have a valid productNames array.`);
      return;
    }

    for (const productName of order.productNames) {
      // Query products collection where 'name' is equal to the product name
      const productQuery = query(
        collection(db, 'products'),
        where('name', '==', productName)
      );
      
      const productSnapshot = await getDocs(productQuery);

      if (productSnapshot.empty) {
        console.error(`Product not found: ${productName}`);
        continue;  // Skip this product and continue with the next one
      }

      const productData = productSnapshot.docs[0].data();
      const updatedQuantity = productData.quantity - 1;
      console.log('Updated Quantity:', updatedQuantity);

      // Check if stock is sufficient
      if (updatedQuantity < 0) {
        throw new Error(`Not enough stock for product ${productName}`);
      }

      // Update product quantity in Firestore
      const productRef = doc(db, 'products', productSnapshot.docs[0].id);
      await updateDoc(productRef, { quantity: updatedQuantity });
    }

    // Update order status to 'fulfilled'
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: 'fulfilled' });

    // Update the order list in state
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: 'fulfilled' } : order
    ));

    console.log("Order fulfilled and product stock updated");
  } catch (error) {
    console.error('Error fulfilling order:', error);
  }
};
  
  
  const handleRemoveOrder = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);

      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error removing order:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Order Form */}
      <h2 className="text-2xl font-bold text-white">Create New Order</h2>
      <p className="text-white text-base mb-6">
      Create, view, and manage customer orders. Start by adding new orders through the form, selecting products, and specifying quantities. Track the status of orders, filter them based on their status, and manage existing orders by marking them as fulfilled or removing them as needed. This ensures a streamlined order processing workflow and accurate inventory management.
      </p>
      <form onSubmit={handleAddOrder} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-4">Customer Name</label>
            <input
              type="text"
              value={newOrder.customer}
              onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-4">Select Product</label>
            <select
              onChange={(e) => handleAddItemToOrder(e.target.value, 1)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a Product</option>
              {productList.map(product => (
                <option key={product.id} value={product.name}>
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Order Items List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
          <div className="space-y-4 mt-4">
            {newOrder.products.map((item, index) => {
              const product = productList.find(p => p.name === item.name) || {};
              return (
                <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-md">
                  <span>{product.name || 'Product not found'}</span>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleProductQuantityChange(item.name, e.target.value)}
                    className="w-20 p-2 border border-gray-300 rounded-md"
                  />
                  <span>${(product.price * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Total */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-white">Total</label>
          <input
            type="text"
            value={newOrder.total}
            readOnly
            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-200"
          />
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Create Order
          </button>
        </div>
      </form>

      {/* Orders Table */}
      <h1 className="text-2xl font-bold text-white">Orders</h1>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mt-4"
      >
        <option value="all">All Orders</option>
        <option value="pending">Pending</option>
        <option value="fulfilled">Fulfilled</option>
      </select>

      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td data-label="Order ID">{order.id}</td>
                <td data-label="Date">{new Date(order.date).toLocaleString()}</td>
                <td data-label="Customer">{order.customer}</td>
                <td data-label="Product Names">{order.productNames ? order.productNames.join(', ') : 'No products'}</td>
                <td data-label="Total">€{order.total}</td>
                <td
                  className={order.status === 'pending' ? 'status-pending' : 'status-fulfilled'}
                  data-label="Status"
                >
                  {order.status}
                </td>
                <td className="actions" data-label="Actions">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleMarkAsFulfilled(order.id)}
                    >
                      Fulfill
                    </button>
                  )}
                  <button
                    className="remove"
                    onClick={() => handleRemoveOrder(order.id)}
                  >
                    <FiTrash size={20} /> {/* Trash Icon */}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>
    </div>
  );
}

export default Orders;
