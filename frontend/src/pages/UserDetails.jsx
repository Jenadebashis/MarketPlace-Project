import React, { useState, useEffect } from 'react';
import { User, Package, Mail, ShieldCheck, AlertCircle, MessageCircle } from 'lucide-react'; // Added MessageCircle
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { apiCall } from '../api';
import { useSelector } from 'react-redux';
import generateRoomId from '../utils/generateId';

const UserDetails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const navigate = useNavigate();
  console.log('the value of id and user over here is: ', { id, user });

  useEffect(() => {
    if (!id) {
      setError("No user ID provided in the URL.");
      setLoading(false);
      return;
    }

    const fetchSeller = async () => {
      console.log('it is getting called or not');
      try {
        const response = await apiCall(`/api/user?id=${id}`, 'GET');
        console.log('the response coming over here is: ', { response });
        setData(response);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchSeller();
  }, [id]);

  const handleStartChat = () => {
    if (!data || !data.userDetails) return;

    const currentUserId = user?.id;
    const sellerId = id;
    const roomId = generateRoomId(currentUserId, sellerId);

    navigate(`/message/${roomId}`, {
      state: {
        sellerId: sellerId,
        sellerName: data.userDetails.name,
        product: data.products?.[0]
      }
    });
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 flex items-center gap-2 p-4"><AlertCircle /> {error}</div>;
  if (!data) return null; // Extra safety check

  const { userDetails, products = [] } = data || {};

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">

        {/* Header / Profile Section */}
        <header className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <User size={48} />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900">{userDetails.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-slate-500">
              <span className="flex items-center gap-1.5"><Mail size={16} /> {userDetails.email}</span>
              <span className="flex items-center gap-1.5 capitalize"><ShieldCheck size={16} /> {userDetails.role}</span>
            </div>

            {/* --- MESSAGE SELLER BUTTON --- */}
            {user && String(user.id) !== String(id) && (
              <button
                onClick={handleStartChat}
                className="mt-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-indigo-100 active:scale-95"
              >
                <MessageCircle size={18} />
                Message Seller
              </button>
            )}
          </div>

          <div className="bg-slate-100 px-6 py-3 rounded-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Products</p>
            <p className="text-2xl font-bold text-slate-800">{products.length}</p>
          </div>
        </header>

        {/* Products Grid */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Package className="text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Assigned Products</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors group">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
                  <Package size={20} className="text-slate-400 group-hover:text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{product.name || 'Unnamed Product'}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.description || 'No description provided for this item.'}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-lg font-bold text-indigo-600">${product.price || '0.00'}</span>
                  <button className="text-xs font-semibold text-slate-400 hover:text-indigo-600 uppercase tracking-widest">View Details</button>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-20 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">No products found for this vendor.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default UserDetails;