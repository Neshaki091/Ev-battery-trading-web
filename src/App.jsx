import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import MyListingsPage from './pages/MyListingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import './App.css';

function Navigation() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('evb_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      const userData = localStorage.getItem('evb_user');
      setUser(userData ? JSON.parse(userData) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check on mount
    const interval = setInterval(() => {
      const userData = localStorage.getItem('evb_user');
      setUser(userData ? JSON.parse(userData) : null);
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('evb_token');
    localStorage.removeItem('evb_user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            EVB Trading
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/create" className="nav-link">Sell</Link>
            {user && (
              <>
                <Link to="/my-listings" className="nav-link">My Listings</Link>
                <Link to="/wishlist" className="nav-link">Wishlist</Link>
              </>
            )}
            <Link to="/cart" className="nav-link">Transactions</Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" className="nav-link">Admin</Link>
            )}
            {user ? (
              <>
                <Link to="/profile" className="nav-link">Profile</Link>
                <button
                  onClick={handleLogout}
                  className="nav-link-button"
                  style={{ background: 'transparent', color: '#2563eb', border: '1px solid #2563eb' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link-button">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/create" element={<CreateListingPage />} />
          <Route path="/edit/:id" element={<EditListingPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-listings" element={<MyListingsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
