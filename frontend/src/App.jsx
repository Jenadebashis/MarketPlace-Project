import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoginForm from './auth/loginForm';
import RegisterForm from './auth/registerForm';
import AddProductForm from './forms/addProductForm';
import ProtectedRoute from './components/protectedRoute';
import VendorDashboard from './components/vendorDashboard';
import Home from './pages/homePage';
import ProductPage, { useCartSync } from './pages/productPage';
import UserDetails from './pages/UserDetails';
import Checkout from './pages/CheckoutPage';
import { apiCall } from './api';
import NotificationToast from './utils/Notification';
import ChatPage from './pages/chatPage';
import { MailIcon } from 'lucide-react';

// --- STYLISH NAVBAR COMPONENT ---
const Navbar = () => {

  const cart = useSelector((state) => state.demo.cart);
  const { conversations } = useSelector((state) => state.inbox);
  const [itemCount, setItemCount] = useState(0);

  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  useEffect(() => {
    const total = cart.reduce((acc, item) => acc + item.qty, 0);
    setItemCount(total);

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('conversations', JSON.stringify(conversations));

    console.log(`Cart updated! Total items: ${total}`);

  }, [cart, conversations]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-black tracking-tighter text-emerald-600">
          TERRA<span className="text-gray-900">MARKET</span>
        </Link>
        <div className="hidden md:flex gap-6 ml-auto text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-emerald-600 transition">Home</Link>
          <Link to="/add-product" className="hover:text-emerald-600 transition">Sell Gear</Link>
          <Link to="/dashboard" className="hover:text-emerald-600 transition">Dashboard</Link>
        </div>
      </div>

      <div className="flex items-center gap-6 ml-2.5">
        <Link to="/checkout" className="relative p-2 text-gray-600 hover:text-emerald-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
              {itemCount}
            </span>
          )}
        </Link>
        <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-emerald-600">Log in</Link>
        <Link
          to="/register"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-bold transition shadow-md shadow-emerald-200"
        >
          Join Now
        </Link>
        <Link to="/messages" className="relative">
          <MailIcon className="w-6 h-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </Link>
        <button
          onClick={handleLogout}
          className="ml-2 flex items-center justify-center p-2 rounded-md bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-200 hover:border-red-200"
          title="Logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const { messages, isConnected } = useSelector((state) => state.chat);
  // const [text, setText] = useState('');
  const dispatch = useDispatch();

  useCartSync(isAuthenticated);
  useEffect(() => {
    // Check if a user token exists in local storage
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }

    // Hydrate the Redux store from the Database on load
    const fetchCart = async () => {
      try {
        const res = await apiCall('/api/cart', 'GET');
        // Update Redux with the items found in MongoDB
        console.log('the res coming here is: ', { res });
        dispatch({ type: 'SET_CART', payload: res });
      } catch (err) {
        console.error("Could not fetch initial cart", err);
      }
    };
    fetchCart();

    const fetchInbox = async () => {
      try {
        const data = await apiCall('/api/chat/inbox', 'GET');
        dispatch({ type: 'inbox/setConversations', payload: data });
      } catch (err) {
        console.error("Inbox fetch failed:", err);
      }
    };
    fetchInbox();
  }, [dispatch]);


  useEffect(() => {
    const token = localStorage.getItem("token");
    dispatch({ type: 'socket/connect', payload: { token } });

    return () => dispatch({ type: 'socket/disconnect' });
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen w-full bg-slate-50 font-sans text-gray-900">
        <Navbar />
        <NotificationToast />

        <main className="container mx-auto">
          <Routes>
            <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
            <Route path="/login" element={<div className="flex justify-center mt-20"><LoginForm /></div>} />
            <Route path="/register" element={<div className="flex justify-center mt-20"><RegisterForm /></div>} />

            <Route element={<ProtectedRoute />}>
              <Route path="/add-product" element={<div className="flex justify-center mt-20"><AddProductForm /></div>} />
              <Route path='/dashboard' element={<div className="flex justify-center mt-20"><VendorDashboard /></div>} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/seller-profile/:id" element={<UserDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/messages" element={<ChatPage />} />
              <Route path="/messages/:roomId" element={<ChatPage />} />
            </Route>

            <Route path="*" element={
              <div className="text-center py-40">
                <h2 className="text-9xl font-black text-gray-200">404</h2>
                <p className="text-xl text-gray-500 mt-4">Looks like you're lost in the woods.</p>
                <Link to="/" className="mt-6 inline-block text-emerald-600 underline">Go back home</Link>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;