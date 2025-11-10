import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function WishlistPage() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('evb_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchWishlist();
  }, [navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wishlist/my');
      const ids = response.data?.data || response.data || [];

      if (!ids || ids.length === 0) {
        setWishlistItems([]);
        return;
      }

      // Fetch details in parallel
      const promises = ids.map(id => 
        api.get(`/listings/${id}`).catch(() => null)
      );
      const items = await Promise.all(promises);
      setWishlistItems(items.filter(item => item !== null).map(item => item.data));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (listingId) => {
    try {
      await api.delete(`/wishlist/${listingId}`);
      alert('Đã xóa khỏi wishlist');
      fetchWishlist();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-xl text-gray-600">Đang tải wishlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="text-xl text-red-600">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Danh sách yêu thích</h1>

        {wishlistItems.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">Danh sách yêu thích trống</p>
            <Link to="/products" className="btn btn-primary">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-1 grid-md-2 grid-lg-4">
            {wishlistItems.map((item) => {
              const itemId = item._id || item.id;
              const imageUrl = item.images && item.images[0]
                ? item.images[0]
                : `https://picsum.photos/seed/${itemId}/600/300`;
              return (
                <div key={itemId} className="product-card">
                  <div className="product-image">
                    <img
                      src={imageUrl}
                      alt={item.title || 'Listing Image'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">
                      {item.title || 'Sản phẩm không tên'}
                    </h3>
                    <p className="product-price">
                      {item.price ? `${item.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <Link to={`/products/${itemId}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                        Xem
                      </Link>
                      <button
                        onClick={() => handleRemoveFromWishlist(itemId)}
                        className="btn"
                        style={{ background: 'transparent', color: '#2563eb', border: '1px solid #2563eb' }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;

