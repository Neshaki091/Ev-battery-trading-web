// 1. IMPORT THÊM useLocation
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

// === ICON CHO UI ===
const IconSearch = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const IconImagePlaceholder = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconEmptyBox = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </svg>
);

// === COMPONENT CHÍNH ===
function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);

  // 2. LẤY LOCATION TỪ HOOK
  const location = useLocation();

  // Tải lại khi location.search (VD: ?category=Vehicle) thay đổi
  useEffect(() => {
    loadListings();
  }, [location.search]); // ◀️ THAY ĐỔI: Phụ thuộc vào location.search

  // Tự động tải lại khi `sortBy` thay đổi
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    loadListings();
  }, [sortBy]);

  const loadListings = async () => {
    try {
      setLoading(true);

      // 3. DÙNG location.search từ hook thay vì window
      const urlParams = new URLSearchParams(location.search);
      const category = urlParams.get('category') || '';

      const q = encodeURIComponent(searchQuery.trim());

      const path = `/search/listings/?q=${q}&sort_by=${sortBy}&limit=12&category=${category}`;

      let data;
      try {
        data = await api.get(path);
      } catch (err) {
        console.warn('Search API failed, falling back to public listings.');
        data = await api.get('/listings/public');
      }

      // ... (Phần còn lại của hàm giữ nguyên) ...
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadListings();
  };

  // ... (Phần JSX return giữ nguyên y hệt) ...
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-body)' }}>
      <div className="container py-8">

        {/* === 1. HERO SECTION === */}
        <div
          className="card text-center mb-8 p-8"
          style={{
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))',
            color: 'white'
          }}
        >
          <h1 className="text-4xl font-bold mb-4">Sàn Giao Dịch Xe Điện & Pin</h1>
          <p className="text-xl mb-6" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Nơi tốt nhất để mua và bán xe điện, pin, và phụ tùng.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/create"
              className="btn btn-primary"
              style={{ background: 'white', color: 'var(--color-primary)' }}
            >
              Đăng tin bán
            </Link>
            <a
              href="#product-grid"
              className="btn"
              style={{ background: 'transparent', border: '1px solid white', color: 'white' }}
            >
              Khám phá
            </a>
          </div>
        </div>

        {/* === 2. DANH MỤC === */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
            Danh mục
          </h2>
          <div className="grid grid-1 grid-md-2 gap-4">
            <Link to="/?category=Vehicle" className="product-card-modern p-6 flex items-center gap-4">
              <div className="text-4xl">🚗</div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                  Xe Điện
                </h3>
                <p style={{ color: 'var(--text-body)' }}>Tìm xe máy, ô tô, và xe đạp điện.</p>
              </div>
            </Link>
            <Link to="/?category=Battery" className="product-card-modern p-6 flex items-center gap-4">
              <div className="text-4xl">🔋</div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                  Pin & Phụ Tùng
                </h3>
                <p style={{ color: 'var(--text-body)' }}>Pin thay thế, sạc, và phụ tùng.</p>
              </div>
            </Link>
          </div>
        </div>


        {/* === 3. THANH TÌM KIẾM & BỘ LỌC === */}
        <div className="card shadow-sm mb-6 p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow flex items-center relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <IconSearch />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm xe, pin, từ khóa..."
                className="form-input w-full pr-10"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* === 4. BỘ LỌC (TÁCH RIÊNG) & TIÊU ĐỀ KẾT QUẢ === */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-heading)' }}>
            Khám phá Sản phẩm
          </h2>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-by" style={{ color: 'var(--text-body)', fontWeight: 500 }}>Sắp xếp theo:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
              style={{ width: 'auto' }}
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng</option>
              <option value="price_desc">Giá giảm</option>
            </select>
          </div>
        </div>

        {/* === 5. KẾT QUẢ (DANH SÁCH SẢN PHẨM) === */}
        <div id="product-grid">
          {loading ? (
            <div className="loading-container text-center py-20">
              <div className="loading-spinner-simple"></div>
              <p className="text-xl mt-4" style={{ color: 'var(--text-body)' }}>Đang tải sản phẩm...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="card text-center py-20">
              <div className="text-gray-400 mx-auto">
                <IconEmptyBox />
              </div>
              <h3 className="mt-2 text-xl font-semibold" style={{ color: 'var(--text-heading)' }}>
                Không tìm thấy sản phẩm
              </h3>
              <p className="mt-1" style={{ color: 'var(--text-body)' }}>
                Vui lòng thử lại với từ khóa hoặc bộ lọc khác.
              </p>
            </div>
          ) : (
            <div className="grid grid-1 grid-md-2 grid-lg-4" style={{ gap: '1.5rem' }}>
              {listings.map((listing) => {
                const listingId = listing._id || listing.id;
                const imageUrl = listing.images && listing.images[0];

                return (
                  <Link
                    key={listingId}
                    to={`/products/${listingId}`}
                    className="product-card-modern"
                  >
                    <div className="product-image-container">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={listing.title || 'Listing Image'}
                          className="product-image-modern"
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          <div className="text-gray-400">
                            <IconImagePlaceholder />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="product-info p-4">
                      <h3 className="product-title font-semibold text-lg">
                        {listing.title || 'Sản phẩm không tên'}
                      </h3>
                      <p className="product-description text-sm mt-1">
                        {listing.description
                          ? listing.description.substring(0, 50) + (listing.description.length > 50 ? '...' : '')
                          : 'Không có mô tả'}
                      </p>
                      <p className="product-price text-lg font-bold mt-3">
                        {listing.price
                          ? `${listing.price.toLocaleString('vi-VN')} VND`
                          : 'Liên hệ'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;