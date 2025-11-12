import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const token = localStorage.getItem('evb_token');

  // === State cho các chức năng review nâng cao ===
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
  const [editingReview, setEditingReview] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // === MỚI: State này để lưu tên tác giả (UserID -> Tên) ===
  const [authorMap, setAuthorMap] = useState({});

  useEffect(() => {
    // === Lấy ID của người dùng hiện tại ===
    const userDataString = localStorage.getItem('evb_user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setCurrentUserId(userData._id || userData.user_id); // Lấy ID của user đã đăng nhập
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
      }
    }

    const fetchProduct = async () => {
      try {
        // Đặt lại tất cả state khi bắt đầu tải
        setLoading(true);
        setError(null);
        setSeller(null);
        setProduct(null); // Đảm bảo product là null khi tải lại

        const response = await api.get(`/listings/${id}`);
        const productData = response.data.data || response.data;

        console.log('API Response productData:', productData);

        // Chỉ setProduct nếu productData có thật
        if (productData) {
          setProduct(productData);

          // Tải thông tin người bán
          const sellerId =
            productData.user_id ||
            productData.sellerId ||
            productData.userId ||
            productData.user;

          if (typeof sellerId === 'object' && sellerId !== null && sellerId._id) {
            setSeller(sellerId);
          } else if (typeof sellerId === 'string') {
            try {
              const sellerResponse = await api.get(`/auth/seller/${sellerId}`);
              const sellerData = sellerResponse.data.data || sellerResponse.data;
              setSeller({ profile: sellerData });
            } catch (err) {
              console.error('Error fetching seller:', err);
              setSeller({
                profile: { username: 'Không rõ', phonenumber: 'N/A', email: 'N/A' },
              });
            }
          }

          // Tải review và stats CHỈ KHI có product
          await loadReviews();
          await loadReviewStats();
        } else {
          // Nếu API trả về data rỗng
          setError('Không tìm thấy thông tin sản phẩm.');
        }

      } catch (err) {
        setError(err.message);
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false); // Hoàn tất tải, dù thành công hay thất bại
      }
    };

    fetchProduct();
  }, [id, token]); // Thêm token vào dependencies


  // === MỚI: useEffect này để tải tên tác giả khi danh sách review thay đổi ===
  useEffect(() => {
    // Nếu không có review, không làm gì cả
    if (reviews.length === 0) return;

    const fetchAuthorNames = async () => {
      // 1. Lấy tất cả các ID người dùng duy nhất từ danh sách review
      //    Lọc ra những ID chưa có trong bản đồ (authorMap)
      const newUserIds = [
        ...new Set(
          reviews
            .map(review => review.userId)
            .filter(userId => userId && !authorMap[userId]) // Chỉ lấy ID mới
        )
      ];

      // Nếu không có ID mới, không cần gọi API
      if (newUserIds.length === 0) return;

      // 2. Tạo một mảng các "lời hứa" (promise) để gọi API cho từng ID
      const authorPromises = newUserIds.map(userId =>
        api.get(`/auth/seller/${userId}`)
          .then(response => {
            const userData = response.data.data || response.data;
            return { id: userId, name: userData.username || 'User không tồn tại' };
          })
          .catch(err => {
            console.error(`Lỗi khi tải user ${userId}:`, err);
            return { id: userId, name: 'User không tồn tại' };
          })
      );

      // 3. Chờ tất cả các API gọi xong
      const authors = await Promise.all(authorPromises);

      // 4. Chuyển mảng kết quả thành một "bản đồ" (Map)
      const newAuthorMap = authors.reduce((map, author) => {
        map[author.id] = author.name;
        return map;
      }, {});

      // 5. Cập nhật state authorMap, giữ lại các tên cũ đã tải
      setAuthorMap(prevMap => ({ ...prevMap, ...newAuthorMap }));
    };

    fetchAuthorNames();
  }, [reviews]); // ◀️ Chạy hàm này mỗi khi state 'reviews' thay đổi


  const loadReviews = async () => {
    try {
      const response = await api.get(`/reviews/listing/${id}`);
      setReviews(response.data?.data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const loadReviewStats = async () => {
    try {
      // Sửa lỗi typo: listings -> stats
      const response = await api.get(`/reviews/stats/${id}`);
      setReviewStats(response.data?.data || { average: 0, count: 0 });
    } catch (err) {
      console.error('Error loading review stats:', err);
    }
  };

  const handleBuy = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    const sellerId =
      product.sellerId || product.user_id || product.userId || product.user;
    const price = product.price;
    let transactionType;
    if (product.category === 'Vehicle') {
      transactionType = 'xe';
    } else if (product.category === 'Battery') {
      transactionType = 'pin';
    } else {
      transactionType = 'xe';
    }
    if (!price || price <= 0) {
      alert('Lỗi: Sản phẩm này không có giá hoặc giá không hợp lệ.');
      return;
    }
    if (!sellerId) {
      alert('Lỗi: Không tìm thấy thông tin người bán của sản phẩm này.');
      return;
    }

    try {
      await api.post('/transactions/', {
        listingId: id,
        type: transactionType,
      });
      alert('Đã tạo đơn hàng');
      navigate('/cart');
    } catch (err) {
      alert(
        'Lỗi khi tạo đơn hàng: ' +
        (err.response?.data?.error ||
          err.response?.data?.message ||
          err.message)
      );
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
      await loadReviewStats();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReportReview = async (reviewId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    // ... (logic prompt)
    try {
      await api.post('/reports/', {
        subjectId: reviewId,
        subjectType: 'REVIEW',
        // ... (reasonCode, details)
      });
      alert('Báo cáo đã được gửi.');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      alert('Đã xóa đánh giá');
      await loadReviews();
      await loadReviewStats();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStartEdit = (review) => {
    setEditingReview({
      id: review._id || review.id,
      content: review.content,
      rating: review.rating.toString()
    });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      await api.put(`/reviews/${editingReview.id}`, {
        content: editingReview.content.trim(),
        rating: parseInt(editingReview.rating)
      });
      alert('Đã cập nhật đánh giá');
      setEditingReview(null);
      await loadReviews();
      await loadReviewStats();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // =================================================================
  // === HÀNG RÀO BẢO VỆ (Guard Clauses) ===
  // =================================================================

  // 1. Ưu tiên hiển thị Đang tải...
  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-xl text-gray-600">Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  // 2. Hiển thị Lỗi nếu có
  if (error) {
    return (
      <div className="error-container">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">
            {error}
          </p>
          <Link
            to="/products"
            className="text-blue-600"
            style={{ textDecoration: 'underline' }}
          >
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  // 3. Hiển thị "Không tìm thấy" nếu không có lỗi NHƯNG product vẫn là null
  if (!product) {
    return (
      <div className="error-container">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">
            Không tìm thấy sản phẩm
          </p>
          <Link
            to="/products"
            className="text-blue-600"
            style={{ textDecoration: 'underline' }}
          >
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  // 4. Nếu code chạy đến đây, `product` CHẮC CHẮN CÓ DỮ LIỆU
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

        {/* --- PHẦN THÔNG TIN SẢN PHẨM --- */}
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
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f3f4f6',
                      color: '#9ca3af',
                      fontSize: '1.125rem',
                      fontWeight: 500,
                    }}
                  >
                    Không có ảnh
                  </div>
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
                {product.price
                  ? `${product.price.toLocaleString('vi-VN')} VND`
                  : 'Liên hệ'}
              </p>

              {/* THÔNG TIN NGƯỜI BÁN */}
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  ℹ️ Thông tin người bán
                </h3>
                {seller ? (
                  <div
                    className="text-gray-700"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <p>
                      <strong>👤 Tên:</strong>{' '}
                      {seller.profile?.username || 'Chưa cập nhật'}
                    </p>
                    <p>
                      <strong>📞 Điện thoại:</strong>{' '}
                      {seller.profile?.phonenumber || 'Không có'}
                    </p>
                    <p>
                      <strong>✉️ Email:</strong>{' '}
                      {seller.profile?.email || 'Không có'}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">Đang tải thông tin người bán...</p>
                )}
              </div>

              {/* MÔ TẢ */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Mô tả</h2>
                <p className="text-gray-600" style={{ whiteSpace: 'pre-wrap' }}>
                  {product.description || 'Không có mô tả'}
                </p>
              </div>

              {/* CÁC NÚT HÀNH ĐỘNG */}
              <div
                style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}
              >
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
                  style={{
                    background: 'transparent',
                    color: '#2563eb',
                    border: '1px solid #2563eb',
                    opacity: !token ? 0.5 : 1,
                  }}
                >
                  ♥ Thích
                </button>
              </div>

              <button
                onClick={handleReport}
                disabled={!token}
                className="btn"
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  fontSize: '0.875rem',
                  opacity: !token ? 0.5 : 1,
                }}
              >
                🚨 Báo cáo tin đăng
              </button>
            </div>
          </div>
        </div>

        {/* --- PHẦN ĐÁNH GIÁ (ĐÃ NÂNG CẤP) --- */}
        <div className="card card-lg mt-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Đánh giá</h3>

          {/* Thống kê */}
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Thống kê</h4>
            <p className="text-gray-700">
              <strong>Tổng số đánh giá:</strong> {reviewStats.count}
            </p>
            <p className="text-gray-700">
              <strong>Rating trung bình:</strong>{' '}
              {reviewStats.average ? reviewStats.average.toFixed(1) : 'Chưa có'} / 5
            </p>
          </div>

          {/* Danh sách review */}
          {reviews.length === 0 ? (
            <div className="text-gray-600">Chưa có đánh giá nào.</div>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {reviews.map((review) => {
                const reviewId = review._id || review.id;
                const isOwner = review.userId === currentUserId;
                const isEditing = editingReview && editingReview.id === reviewId;

                return (
                  <div
                    key={reviewId}
                    className="p-4 border rounded-lg"
                    style={{
                      borderTop: '1px solid #eef2f7',
                      paddingTop: '1rem',
                      background: isEditing ? '#fefce8' : '#fff'
                    }}
                  >
                    {isEditing ? (
                      // Form Sửa Đánh Giá
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Chỉnh sửa đánh giá
                        </h4>
                        <textarea
                          rows="3"
                          className="form-input mb-2"
                          value={editingReview.content}
                          onChange={(e) =>
                            setEditingReview({ ...editingReview, content: e.target.value })
                          }
                        />
                        <select
                          className="form-input mb-2"
                          value={editingReview.rating}
                          onChange={(e) =>
                            setEditingReview({ ...editingReview, rating: e.target.value })
                          }
                        >
                          <option value="5">5</option>
                          <option value="4">4</option>
                          <option value="3">3</option>
                          <option value="2">2</option>
                          <option value="1">1</option>
                        </select>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button onClick={handleUpdateReview} className="btn btn-primary">
                            Lưu
                          </button>
                          <button onClick={handleCancelEdit} className="btn">
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Hiển thị Đánh Giá
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {/* === SỬA LỖI: Tra cứu tên trong authorMap === */}
                          <strong>{authorMap[review.userId] || 'Đang tải tên...'}</strong>

                          <span
                            className="text-gray-600"
                            style={{ fontSize: '0.875rem' }}
                          >
                            {new Date(review.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-gray-600 mb-2">
                          Rating: {review.rating} / 5
                        </div>
                        <div className="text-gray-600 mb-2">
                          {review.content || ''}
                        </div>

                        {/* Các nút hành động cho review */}
                        {token && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            {isOwner ? (
                              <>
                                <button
                                  onClick={() => handleStartEdit(review)}
                                  className="btn"
                                  style={{
                                    fontSize: '0.875rem',
                                    padding: '0.25rem 0.5rem',
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    border: '1px solid #d1d5db'
                                  }}
                                >
                                  ✏️ Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(reviewId)}
                                  className="btn"
                                  style={{
                                    fontSize: '0.875rem',
                                    padding: '0.25rem 0.5rem',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca'
                                  }}
                                >
                                  🗑️ Xóa
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleReportReview(reviewId)}
                                className="btn"
                                style={{
                                  fontSize: '0.875rem',
                                  padding: '0.25rem 0.5rem',
                                  background: 'transparent',
                                  color: '#dc2626',
                                  border: '1px solid #dc2626',
                                }}
                              >
                                🚨 Báo cáo đánh giá
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Form Gửi Review Mới */}
          {token && !editingReview && (
            <div
              style={{
                marginTop: '1rem',
                borderTop: '1px solid #eef2f7',
                paddingTop: '1rem',
              }}
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Gửi đánh giá
              </h4>
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