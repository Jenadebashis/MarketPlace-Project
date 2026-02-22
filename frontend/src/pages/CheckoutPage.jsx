import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const cart = useSelector((state) => state.demo.cart);
  const dispatch = useDispatch();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? 15.00 : 0;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">Your cart is as empty as a desert.</p>
              <Link to="/products" className="text-emerald-600 font-bold underline">Go find some gear</Link>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex items-center gap-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <img src={'https://imgs.search.brave.com/dvNTniOdCu9dvKOuQw5b8vEcPzw59xvVSSVVa9cVXw8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vcGljanVt/Ym8uY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy9zaWxob3VldHRl/LW9mLXlvdW5nLWJs/b25kZS13aXRoLXNo/b3J0LWhhaXItb24t/b3JhbmdlLWJhY2tn/cm91bmQtZnJlZS1p/bWFnZS5qcGVnP2g9/ODAwJnF1YWxpdHk9/ODA'} className="w-24 h-24 object-cover rounded-xl bg-gray-100" alt="" />
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.category}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button 
                      onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item._id })}
                      className="text-gray-400 hover:text-red-500 font-bold"
                    > − </button>
                    <span className="font-medium">{item.qty}</span>
                    <button 
                      onClick={() => dispatch({ type: 'ADD_TO_CART', payload: item })}
                      className="text-gray-400 hover:text-emerald-600 font-bold"
                    > + </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">${(item.price * item.qty).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl h-fit">
          <h2 className="text-xl font-bold mb-6">Summary</h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-gray-900">${shipping.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-black text-emerald-600">${total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            disabled={cart.length === 0}
            className="w-full mt-8 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition disabled:bg-gray-200"
          >
            Secure Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;