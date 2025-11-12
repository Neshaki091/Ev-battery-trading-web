import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === SỬA LỖI 2: LOGIC MICROSERVICE ===
  // Chúng ta phải gọi 2 API: 1 sang Transaction, 1 sang Listing
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // 1. Lấy lịch sử giao dịch (chỉ chứa ID)
        const response = await api.get('/transactions/history');
        const orders = response.data?.data || response.data || [];

        if (orders.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        // 2. Trích xuất tất cả các listingId duy nhất
        const listingIds = [...new Set(orders.map(order => order.listingId))];

        // 3. Gọi song song sang Listing Service để lấy thông tin chi tiết
        const listingPromises = listingIds.map(id =>
          api.get(`/listings/${id}`).catch(err => null) // Bỏ qua nếu tin đăng bị xóa
        );
        const listingResponses = await Promise.all(listingPromises);

        // 4. Tạo một "Map" (từ điển) để tra cứu thông tin listing
        const listingsMap = {};
        listingResponses.forEach(res => {
          if (res && res.data) {
            // Dữ liệu có thể nằm trong .data.data hoặc .data
            const listingData = res.data.data || res.data;
            listingsMap[listingData._id] = listingData;
          }
        });

        // 5. Gộp thông tin từ 2 service lại
        const items = orders.map(order => {
          const listingDetail = listingsMap[order.listingId]; // Tra cứu
          return {
            id: order._id || order.id,
            name: listingDetail?.title || 'Tin đăng đã bị xóa', // Lấy title từ Listing
            price: order.price || 0, // Lấy price từ Transaction (an toàn)
            quantity: 1,
            image: listingDetail?.images?.[0] || null, // Lấy ảnh từ Listing
            status: order.status
          };
        });
        // === KẾT THÚC SỬA LỖI 2 ===

        setCartItems(items);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []); // Chỉ chạy 1 lần khi load

  const handleRemoveItem = async (itemId) => {
    alert('Giao dịch không thể xóa. Vui lòng liên hệ admin nếu cần hủy.');
  };

  const handlePayOrder = async (orderId) => {
    try {
      await api.post(`/transactions/${orderId}/payment/`);
      alert('Thanh toán thành công');

      // Sửa: Cập nhật trạng thái ngay trên UI mà không cần gọi lại API
      setCartItems(currentItems =>
        currentItems.map(item =>
          item.id === orderId ? { ...item, status: 'paid' } : item
        )
      );

    } catch (err) {
      // === SỬA LỖI 1: HIỂN THỊ ĐÚNG TIN NHẮN LỖI ===
      console.error('Error paying order object:', err);
      // Backend gửi lỗi trong 'error', không phải 'message'
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      console.error('Lỗi từ Backend:', errorMessage);
      alert('Không thể thanh toán: ' + errorMessage);
      // === KẾT THÚC SỬA LỖI 1 ===
    }
  };

  const handleDownloadContract = async (orderId) => {
    try {
      const response = await api.get(`/transactions/${orderId}/contract/`, {
        responseType: 'blob',
      });

      // ... (Logic tải file PDF của bạn ở đây là đúng, giữ nguyên) ...
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contract_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Đang tải hợp đồng...');

    } catch (err) {
      console.error('Error downloading contract:', err);

      // === BẮT ĐẦU SỬA LỖI HIỂN THỊ ALERT ===
      let errorMessage = err.message; // Tin nhắn dự phòng

      // Kiểm tra xem data lỗi có phải là Blob không
      if (err.response && err.response.data instanceof Blob) {
        try {
          // Chuyển Blob (file) thành Text (chuỗi)
          const errorText = await err.response.data.text();
          // Chuyển Text (chuỗi) thành JSON
          const errorJson = JSON.parse(errorText);
          // Bây giờ chúng ta có thể đọc tin nhắn lỗi
          errorMessage = errorJson.error || errorJson.message || err.message;
        } catch (parseError) {
          console.error('Không thể đọc lỗi từ Blob:', parseError);
          errorMessage = 'Lỗi không xác định khi tải hợp đồng.';
        }
      } else {
        // Nếu lỗi không phải Blob, đọc như bình thường
        errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      }

      alert('Không thể tải hợp đồng: ' + errorMessage);
      // === KẾT THÚC SỬA LỖI ===
    }
  };

  const calculateTotal = () => {
    // Sửa: Chỉ tính tổng các đơn hàng 'pending'
    const pendingItems = cartItems.filter(item => item.status === 'pending');
    return pendingItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-xl text-gray-600">Đang tải giỏ hàng...</div>
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
    // ... (Toàn bộ phần JSX return của bạn là chính xác, giữ nguyên) ...
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Lịch sử giao dịch</h1>

        {cartItems.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">Bạn chưa có giao dịch nào</p>
            <Link to="/products" className="btn btn-primary">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-1 grid-lg-3" style={{ gap: '2rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div className="card">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '96px',
                        height: '96px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.25rem' }}
                        />
                      ) : (
                        <span className="text-gray-600" style={{ fontSize: '0.75rem' }}>No image</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.name || item.productName}
                      </h3>
                      <p className="text-blue-600 font-semibold">
                        {item.price ? `${item.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        {item.price.toLocaleString('vi-VN')} VND
                      </p>
                      <div className="text-gray-600 mb-2" style={{ fontSize: '0.875rem' }}>
                        Trạng thái: {item.status || 'pending'}
                      </div>
                      {item.status === 'pending' && (
                        <button
                          onClick={() => handlePayOrder(item.id)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        >
                          Thanh toán
                        </button>
                      )}
                      {item.status === 'paid' && (
                        <button
                          onClick={() => handleDownloadContract(item.id)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                          _E_
                        >
                          ⬇️ Tải Hợp Đồng
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              Such           </div>

            <div>
              <div className="card sticky p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tổng cộng</h2>
                <div style={{ marginBottom: '1rem' }}>
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>Tạm tính:</span>
                    <span>{calculateTotal().toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>Phí vận chuyển:</span>
                    <span>0 đ</span>
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid #e5e7eb',
                      paddingTop: '0.5rem',
                    }}
                    className="flex justify-between text-xl font-bold text-gray-900"
                    Methods               >
                    <span>Tổng:</span>
                    <span>{calculateTotal().toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-full">
                  Section               Thanh toán
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;