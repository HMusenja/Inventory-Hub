import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp if you're using Firestore's Timestamp

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalOrders: 0,
    pendingOrders: 0,
    fulfilledOrders: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const db = getFirestore();

  const lowStockThreshold = 10;

  useEffect(() => {
    // Fetch product data
    const fetchProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const products = snapshot.docs.map(doc => doc.data());
      const totalProducts = products.length;
      const lowStockItems = products.filter(product => product.quantity <= lowStockThreshold).length;

      setStats(prevStats => ({
        ...prevStats,
        totalProducts,
        lowStock: lowStockItems,
      }));
    });

    // Fetch order data
    const fetchOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const orders = snapshot.docs.map(doc => doc.data());
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const fulfilledOrders = orders.filter(order => order.status === 'fulfilled').length;

      setStats(prevStats => ({
        ...prevStats,
        totalOrders,
        pendingOrders,
        fulfilledOrders,
      }));

      const recentOrders = orders.slice(0, 5);
      const orderActivities = recentOrders.map(order => ({
        id: order.id || Math.random().toString(36).substring(2), // Fallback for missing ID
        message: `${order.customer || 'A customer'} ${
          order.status === 'pending' ? 'placed' : 'fulfilled'
        } an order.`,
        time: parseFirestoreDate(order.date), // Handle the date properly
      }));

      updateRecentActivity(orderActivities);
    });

    // Fetch stock adjustments and update recent activity
    const fetchStockAdjustments = onSnapshot(collection(db, 'stockAdjustments'), (snapshot) => {
      const adjustments = snapshot.docs.map(doc => doc.data());
      const recentAdjustments = adjustments.slice(0, 5);
      const adjustmentActivities = recentAdjustments.map(adj => ({
        id: adj.id || Math.random().toString(36).substring(2), // Fallback for missing ID
        message: `${adj.quantity || 0} piece(s) of "${adj.productName || 'Unknown'}" was ${
          adj.adjustmentType || 'adjusted'
        } in stock. Reason: ${adj.reason || 'Not provided'}.`,
        time: parseFirestoreDate(adj.date), // Handle the date properly
      }));

      updateRecentActivity(adjustmentActivities);
    });

    // Function to update the recent activities list
    const updateRecentActivity = (newActivities) => {
      setRecentActivity(prev => {
        const combined = [...prev, ...newActivities];
        return combined.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);
      });
    };

    // Function to parse Firestore date (either as a Timestamp or string)
    const parseFirestoreDate = (date) => {
      if (!date) return 'Unknown date'; // Handle missing dates

      if (date instanceof Timestamp) {
        // If it's a Firestore Timestamp, convert it to a JavaScript Date
        return date.toDate().toLocaleString();
      }

      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? 'Invalid date' : parsedDate.toLocaleString();
    };

    // Cleanup function for the useEffect hook
    return () => {
      fetchProducts();
      fetchOrders();
      fetchStockAdjustments();
    };
  }, [db]);

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="text-white text-base mb-16">
        The Dashboard provides an at-a-glance summary of your business operations, including key
        metrics such as total products, low stock items, total orders, and pending or fulfilled
        orders. It also features a Recent Activity section to keep you informed about the latest
        stock adjustments and customer orders, ensuring you're always up to date.
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="bg-blue-100 p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('/inventory')}
        >
          <h3 className="text-gray-500 text-sm">Total Products</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
        </div>
        <div 
          className="bg-red-100 p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('/inventory')}
        >
          <h3 className="text-gray-500 text-sm">Low Stock Items</h3>
          <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
        </div>
        <div 
          className="bg-green-100 p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('/orders')}
        >
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        <div 
          className="bg-yellow-100 p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('/orders')}
        >
          <h3 className="text-gray-500 text-sm">Pending Orders</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
        </div>

        <div 
          className="bg-purple-100 p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('/orders')}
        >
          <h3 className="text-gray-500 text-sm">Fulfilled Orders</h3>
          <p className="text-2xl font-bold text-green-600">{stats.fulfilledOrders}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        {/* Responsive Layout for Recent Activity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentActivity.map((activity, index) => (
            <div
              key={activity.id || index}
              className="bg-blue-200 p-4 rounded-md shadow-lg"
            >
              <p className="text-gray-800">{activity.message}</p>
              <p className="text-sm text-blue-900">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
