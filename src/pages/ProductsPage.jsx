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
      <div className="loading-container">
        <div className="text-xl text-gray-600">Đang tải sản phẩm...</div>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Danh sách sản phẩm</h1>
        
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">Chưa có sản phẩm nào</p>
          </div>
        ) : (
          <div className="grid grid-1 grid-md-2 grid-lg-4">
            {products.map((product) => {
              const productId = product._id || product.id;
              const imageUrl = product.images && product.images[0] 
                ? product.images[0] 
                : `https://picsum.photos/seed/${productId}/600/300`;
              return (
                <Link
                  key={productId}
                  to={`/products/${productId}`}
                  className="product-card"
                >
                  <div className="product-image">
                    <img
                      src={imageUrl}
                      alt={product.title || 'Listing Image'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">
                      {product.title || product.name || 'Sản phẩm không tên'}
                    </h3>
                    <p className="product-description">
                      {product.description ? product.description.substring(0, 50) + '...' : 'Không có mô tả'}
                    </p>
                    <p className="product-price">
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

