import { useNavigate } from 'react-router-dom';
import systemImage from '../assets/system.png';
function Home() {
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('./assets/home-bg.jpg')" }}>
      <div className="bg-white bg-opacity-80 p-12 rounded-xl shadow-2xl text-center max-w-5xl w-full mx-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          The Inventory Hub
        </h1>
        <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
          A comprehensive solution for managing your inventory efficiently and effectively.
          Track stock levels, manage orders, and optimize your business operations.
        </p>
        <div className="mb-10">
          <img
            src={systemImage}
            alt="System Overview"
            className="w-full max-w-3xl mx-auto rounded-lg shadow-md"
          />
        </div>
        <div className="space-x-6">
          <button
            onClick={() => handleNavigation('/dashboard')}
            className="bg-blue-600 text-white px-8 py-4 text-lg rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => handleNavigation('/inventory')}
            className="bg-green-600 text-white px-8 py-4 text-lg rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            View Inventory
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
          <div className="p-6 bg-white bg-opacity-90 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Easy Management</h3>
            <p className="text-gray-600">Streamline your inventory operations with our intuitive interface.</p>
          </div>
          <div className="p-6 bg-white bg-opacity-90 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Real-time Tracking</h3>
            <p className="text-gray-600">Monitor stock levels and orders in real-time with accurate updates.</p>
          </div>
          <div className="p-6 bg-white bg-opacity-90 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Smart Analytics</h3>
            <p className="text-gray-600">Make data-driven decisions with comprehensive analytics and reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Home;