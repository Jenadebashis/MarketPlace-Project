import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import LoginForm from './auth/loginForm';
import RegisterForm from './auth/registerForm';
import AddProductForm from './forms/addProductForm';
import ProtectedRoute from './components/protectedRoute';
import VendorDashboard from './components/vendorDashboard';
import Home from './pages/homePage';
import ProductPage from './pages/productPage';
import UserDetails from './pages/UserDetails';

// --- STYLISH NAVBAR COMPONENT ---
const Navbar = () => {
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
        <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-emerald-600">Log in</Link>
        <Link
          to="/register"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-bold transition shadow-md shadow-emerald-200"
        >
          Join Now
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

  useEffect(() => {
    // Check if a user token exists in local storage
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen w-full bg-slate-50 font-sans text-gray-900">
        <Navbar />

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