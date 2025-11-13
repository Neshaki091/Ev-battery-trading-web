import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Endpoint theo evb_trading_platform_frontend.html
        // Thử search trước, nếu lỗi thì fallback về listings/public
        let response;
        try {
          response = await api.get('/search/listings/?q=&sort_by=newest&limit=12');
          // Xử lý response data theo format từ HTML
          let listings = [];
          const data = response.data;
          if (data?.data?.listings && Array.isArray(data.data.listings)) {
            listings = data.data.listings;
          } else if (data?.listings && Array.isArray(data.listings)) {
            listings = data.listings;
          } else if (data?.data && Array.isArray(data.data)) {
            listings = data.data;
          } else if (Array.isArray(data)) {
            listings = data;
          }
          setProducts(listings);
        } catch (searchErr) {
          // Fallback to public listings
          response = await api.get('/listings/public');
          const data = response.data;
          let listings = [];
          if (data?.data && Array.isArray(data.data)) {
            listings = data.data;
          } else if (Array.isArray(data)) {
            listings = data;
          }
          setProducts(listings);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="loading-container text-center py-20">
        <div className="loading-spinner-simple"></div>
        <p className="text-xl mt-4" style={{ color: 'var(--text-body)' }}>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container text-center py-20">
        <h3 className="text-xl font-semibold" style={{ color: 'var(--color-danger)' }}>
          Lỗi: {error}
        </h3>
        <p className="mt-2" style={{ color: 'var(--text-body)' }}>
          Không thể tải dữ liệu. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-heading)' }}>Danh sách sản phẩm</h1>
        
        {products.length === 0 ? (
          <div className="card text-center py-20">
            <div style={{ color: '#9ca3af', margin: '0 auto', fontSize: '3rem' }}>
              <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-xl my-4" style={{ color: 'var(--text-body)' }}>Chưa có sản phẩm nào</p>
          </div>
        ) : (
          <div className="grid grid-1 grid-md-2 grid-lg-4" style={{ gap: '1.5rem' }}>
            {products.map((product) => {
              const productId = product._id || product.id;
              const imageUrl = product.images && product.images[0];
              return (
                <Link
                  key={productId}
                  to={`/products/${productId}`}
                  className="product-card-modern"
                >
                  <div className="product-image-container">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.title || 'Listing Image'}
                        className="product-image-modern"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <div className="text-gray-400">
                          <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="product-info p-4">
                    <h3 className="product-title font-semibold text-lg">
                      {product.title || product.name || 'Sản phẩm không tên'}
                    </h3>
                    <p className="product-description text-sm mt-1">
                      {product.description ? product.description.substring(0, 50) + (product.description.length > 50 ? '...' : '') : 'Không có mô tả'}
                    </p>
                    <p className="product-price text-lg font-bold mt-3">
                      {product.price ? `${product.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
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

export default ProductsPage;

