import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircle } from 'lucide-react';
import { apiCall } from '../api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const finalizeOrder = async () => {
      if (sessionId) {
        dispatch({ type: 'CLEAR_CART' });

        try {
          await apiCall('/api/cart/clear', 'DELETE');
          console.log("Database cart cleared.");
        } catch (err) {
          console.error("Failed to clear DB cart:", err);
        }
      }
    };

    finalizeOrder();
  }, [sessionId, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 p-4 rounded-full">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Adventure Booked!</h1>
        <p className="text-gray-500 mb-8">
          Your payment was successful. Get your gear ready—nature is calling.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Order Reference
          </p>
          <p className="text-sm font-mono text-gray-600 break-all">
            {sessionId || "N/A"}
          </p>
        </div>

        <Link
          to="/"
          className="block w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
        >
          Back to Explorations
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;