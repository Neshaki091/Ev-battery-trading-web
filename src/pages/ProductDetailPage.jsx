import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const token = localStorage.getItem('evb_token');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/listings/${id}`);
        setProduct(response.data);
        await loadReviews();
      } catch (err) {
        setError(err.message);
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const loadReviews = async () => {
    try {
      const response = await api.get(`/reviews/listing/${id}`);
      setReviews(response.data?.data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const handleBuy = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/transactions/', {
        listingId: id,
        type: product.category || 'xe',
      });
      alert('Đã tạo đơn hàng');
      navigate('/cart');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddToWishlist = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/wishlist/', { listingId: id });
      alert('Đã thêm vào wishlist');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReport = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    const reasonCode = prompt('Nhập mã lỗi (SPAM, HARASSMENT, OTHER):');
    if (!reasonCode) return;

    const details = prompt('Chi tiết báo cáo (optional):');

    try {
      await api.post('/reports/', {
        subjectId: id,
        subjectType: 'LISTING',
        reasonCode,
        details,
      });
      alert('Báo cáo đã được gửi.');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmitReview = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/reviews/', {
        listingId: id,
        rating: parseInt(reviewRating),
        content: reviewContent.trim(),
      });
      alert('Đã gửi đánh giá');
      setReviewContent('');
      setReviewRating('5');
      await loadReviews();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReportReview = async (reviewId) => {
    if (!token) {
      navigate('/login');
      return;
    }

    const reasonCode = prompt('Nhập mã lỗi (SPAM, HARASSMENT, OTHER):');
    if (!reasonCode) return;

    const details = prompt('Chi tiết báo cáo (optional):');

    try {
      await api.post('/reports/', {
        subjectId: reviewId,
        subjectType: 'REVIEW',
        reasonCode,
        details,
      });
      alert('Báo cáo đã được gửi.');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-xl text-gray-600">Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">
            {error || 'Không tìm thấy sản phẩm'}
          </p>
          <Link to="/products" className="text-blue-600" style={{ textDecoration: 'underline' }}>
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600"
          style={{ background: 'none', textDecoration: 'underline' }}
        >
          ← Quay lại
        </button>

        <div className="card card-lg">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '100%' }}>
              <div className="product-image" style={{ height: '384px' }}>
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title || 'Listing Image'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={`https://picsum.photos/seed/${id}/800/400`}
                    alt={product.title || 'Listing Image'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
            </div>
            <div className="p-8" style={{ width: '100%' }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.title || product.name || 'Sản phẩm không tên'}
              </h1>
              <div className="text-gray-600 mb-2">
                {product.location || ''} • {product.condition || ''}
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-6">
                {product.price ? `${product.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
              </p>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Mô tả</h2>
                <p className="text-gray-600" style={{ whiteSpace: 'pre-wrap' }}>
                  {product.description || 'Không có mô tả'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  onClick={handleBuy}
                  disabled={!token}
                  className="btn btn-primary"
                  style={{ flex: 1, opacity: !token ? 0.5 : 1 }}
                >
                  Mua ngay
                </button>
                <button
                  onClick={handleAddToWishlist}
                  disabled={!token}
                  className="btn"
                  style={{ background: 'transparent', color: '#2563eb', border: '1px solid #2563eb', opacity: !token ? 0.5 : 1 }}
                >
                  ♥ Thích
                </button>
              </div>
              <button
                onClick={handleReport}
                disabled={!token}
                className="btn"
                style={{ width: '100%', background: 'transparent', color: '#dc2626', border: '1px solid #dc2626', fontSize: '0.875rem', opacity: !token ? 0.5 : 1 }}
              >
                🚨 Báo cáo tin đăng
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="card card-lg mt-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Đánh giá</h3>
          {reviews.length === 0 ? (
            <div className="text-gray-600">Chưa có đánh giá nào.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((review) => {
                const reviewId = review._id || review.id;
                return (
                  <div key={reviewId} style={{ borderTop: '1px solid #eef2f7', paddingTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong>{review.userId || review.user || 'User'}</strong>
                      <span className="text-gray-600" style={{ fontSize: '0.875rem' }}>
                        {new Date(review.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-600 mb-2">{review.content || ''}</div>
                    <div className="text-gray-600 mb-2">Rating: {review.rating}</div>
                    {token && (
                      <button
                        onClick={() => handleReportReview(reviewId)}
                        className="btn"
                        style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', background: 'transparent', color: '#dc2626', border: '1px solid #dc2626' }}
                      >
                        🚨 Báo cáo đánh giá
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {token && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid #eef2f7', paddingTop: '1rem' }}>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Gửi đánh giá</h4>
              <textarea
                rows="3"
                className="form-input mb-2"
                placeholder="Nội dung"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />
              <select
                className="form-input mb-2"
                value={reviewRating}
                onChange={(e) => setReviewRating(e.target.value)}
              >
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
              <button onClick={handleSubmitReview} className="btn btn-primary">
                Gửi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;

