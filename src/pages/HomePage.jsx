import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []); // <-- SỬA ĐỔI: Gỡ [sortBy] đi để tránh gọi 2 lần lúc tải trang

  const loadListings = async () => {
    try {
      setLoading(true);
      const q = encodeURIComponent(searchQuery.trim());
      // Sửa sortBy thành sort_by để khớp với API
      const path = `/search/listings/?q=${q}&sort_by=${sortBy}&limit=12`; 

      let data;
      try {
        data = await api.get(path);
      } catch (err) {
        // Fallback to public listings
        console.warn('Search API failed, falling back to public listings.'); // Thêm log
        data = await api.get('/listings/public');
      }

      // Parse listings from response
      let listingsData = [];
      const responseData = data.data;
      if (responseData?.data?.listings && Array.isArray(responseData.data.listings)) {
        listingsData = responseData.data.listings;
      } else if (responseData?.listings && Array.isArray(responseData.listings)) {
        listingsData = responseData.listings;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        listingsData = responseData.data;
      } else if (Array.isArray(responseData)) {
        listingsData = responseData;
      }

      setListings(listingsData);
    } catch (err) {
      console.error('Error loading listings:', err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadListings();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="card mb-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '300px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm xe, pin, từ khóa..."
                className="form-input"
                style={{ flex: 1 }}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng</option>
                <option value="price_desc">Giá giảm</option>
              </select>
              <button type="submit" className="btn btn-primary">
                Tìm
              </button>
            </form>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="text-xl text-gray-600">Đang tải...</div>
          </div>
        ) : listings.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-xl text-gray-600">Không có tin nào.</p>
          </div>
        ) : (
          <div className="grid grid-1 grid-md-2 grid-lg-4">
            {listings.map((listing) => {
              const listingId = listing._id || listing.id;
              
              // === SỬA ĐỔI LOGIC HÌNH ẢNH ===
              // 1. Chỉ lấy URL nếu tồn tại
              const imageUrl = listing.images && listing.images[0]; 

              return (
                <Link
                  key={listingId}
                  to={`/products/${listingId}`}
                  className="product-card"
                >
                  <div className="product-image">
                    {/* 2. Dùng conditional rendering (giống ProductDetailPage.js) */}
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={listing.title || 'Listing Image'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      // 3. Hiển thị ô màu xám nếu không có ảnh
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f3f4f6',
                          color: '#9ca3af',
                        }}
                      >
                        Không có ảnh
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">
                      {listing.title || 'Sản phẩm không tên'}
                    </h3>
                    <p className="product-description">
                      {listing.description ? listing.description.substring(0, 50) + '...' : 'Không có mô tả'}
                    </p>
                    <p className="product-price">
                      {listing.price ? `${listing.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;