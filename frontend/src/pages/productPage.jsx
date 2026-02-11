import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual API endpoint URL
    const fetchProducts = async () => {
      try {
        const response = await apiCall('/api/product', 'GET'); // Adjust path as needed
        console.log("Full Response:", response);
        setProducts(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-500 mt-2">Authentic gear and experiences curated by experts.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 group">
              {/* Image Container */}
              <div className="h-64 overflow-hidden relative bg-gray-200">
                <img
                  src={'https://imgs.search.brave.com/y3jhA9Soy8q9KT5a1qeTA_GzrWI-mMV-QIH_DvgH5LU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c3RvY2t2YXVsdC5u/ZXQvZGF0YS8yMDE5/LzAzLzA2LzI2MTc3/Ni90aHVtYjE2Lmpw/Zw'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-emerald-600 transition">
                    {product.name}
                  </h3>

                  {/* Seller Name from your enriched backend data */}
                  <p className="text-sm text-gray-400 mt-1">
                    Selling by <span className="text-gray-600 font-medium">{product.sellerName}</span>
                  </p>

                  <div className="mt-6 flex justify-between items-end">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
                        {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-gray-900">${product.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No products found matching your criteria.
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductPage;