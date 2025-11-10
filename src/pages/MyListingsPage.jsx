import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function MyListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('evb_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchMyListings();
  }, [navigate]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/listings/my?limit=50');
      const listingsData = response.data?.data || [];
      setListings(listingsData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching my listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin đăng này không?')) return;

    try {
      await api.delete(`/listings/${listingId}`);
      alert('Tin đăng đã được xóa.');
      fetchMyListings();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-xl text-gray-600">Đang tải tin đăng của bạn...</div>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Tin đăng của tôi ({listings.length})
        </h1>

        {listings.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">Bạn chưa có tin đăng nào</p>
            <Link to="/create" className="btn btn-primary">
              Tạo tin đăng mới
            </Link>
          </div>
        ) : (
          <div className="grid grid-1 grid-md-2 grid-lg-3">
            {listings.map((listing) => {
              const listingId = listing._id || listing.id;
              const imageUrl = listing.images && listing.images[0]
                ? listing.images[0]
                : `https://picsum.photos/seed/${listingId}/600/300`;
              return (
                <div key={listingId} className="product-card">
                  <div className="product-image">
                    <img
                      src={imageUrl}
                      alt={listing.title || 'Listing Image'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">
                      {listing.title || 'Sản phẩm không tên'}
                    </h3>
                    <div className="text-gray-600 mb-2">
                      Status: <strong>{listing.status}</strong>
                    </div>
                    <p className="product-price">
                      {listing.price ? `${listing.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <Link to={`/products/${listingId}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                        Xem
                      </Link>
                      <Link to={`/edit/${listingId}`} className="btn" style={{ background: 'transparent', color: '#2563eb', border: '1px solid #2563eb', textAlign: 'center' }}>
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDeleteListing(listingId)}
                        className="btn"
                        style={{ background: 'transparent', color: '#dc2626', border: '1px solid #dc2626' }}
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

export default MyListingsPage;

