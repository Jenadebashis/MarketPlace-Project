import React, { useEffect, useState } from 'react';
import { apiCall } from '../api';

const VendorDashboard = () => {
  const [data, setData] = useState({ userDetails: {}, products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await apiCall('/api/user/dashboard', 'GET');
        setData(result);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="text-red-500 p-10">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* User Info Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6 border-l-4 border-blue-500">
        <h2 className="text-2xl font-bold mb-2">Welcome, {data.userDetails.name}</h2>
        <p className="text-gray-600">{data.userDetails.email} • <span className="capitalize">{data.userDetails.role}</span></p>
      </div>

      {/* Products Section */}
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.products.length > 0 ? (
          data.products.map(product => (
            <div key={product._id} className="border p-4 rounded hover:shadow-md transition bg-gray-50 flex flex-col gap-3">
              {/* Image Container */}
              <div className="w-full h-48 overflow-hidden rounded bg-gray-200">
                <img
                  src={`https://marketplace-project-xi5v.onrender.com/${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'http://localhost:3000/uploads\\1770086081517-476175908.png'; }} // Fallback if image fails
                />
              </div>

              <div>
                <h4 className="font-medium text-lg text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-500">Price: ₹{product.price}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;