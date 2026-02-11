import { Link } from "react-router-dom";
import ProductPage from "./productPage";

const Home = ({ isAuthenticated }) => {
  // 1. Condition: If logged in, show Product Page immediately
  if (isAuthenticated) {
    return <ProductPage />;
  }

  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-emerald-600 font-bold tracking-widest uppercase text-xs">Premium Nature Marketplace</span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mt-4 leading-tight">
            Explore the <br /><span className="text-emerald-600">Great Outdoors.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Buy gear, book nature experiences, and connect with explorers.
          </p>
          <div className="mt-10 flex gap-4">
            <Link to="/login" className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition">
              Start Exploring
            </Link>
          </div>
        </div>
        <div className="bg-emerald-100 rounded-3xl aspect-square relative">
          {/* Nature Image Placeholder */}
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"
            alt="Mountains"
            className="rounded-3xl object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;