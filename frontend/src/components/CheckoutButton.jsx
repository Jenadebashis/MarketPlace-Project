import React, { useState } from 'react';
import { apiCall } from '../api';

const CheckoutButton = ({ cart }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      const data = await apiCall('/checkout/create-session', 'POST');

      if (data.url) {
        window.location.href = data.url; 
      } else {
        alert("Session creation failed. Please try again.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      const message = error.response?.data?.message || "Something went wrong.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading || cart.length === 0}
      className="w-full mt-8 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition disabled:bg-gray-200"
    >
      {loading ? 'Processing...' : 'Secure Checkout'}
    </button>
  );
};

export default CheckoutButton;