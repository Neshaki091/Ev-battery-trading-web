import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Endpoint theo evb_trading_platform_frontend.html - sử dụng transactions/history
        const response = await api.get('/transactions/history');
        const orders = response.data?.data || response.data || [];
        // Chuyển đổi orders thành cart items format
        const items = orders.map(order => ({
          id: order._id || order.id,
          name: order.listingTitle || 'Sản phẩm',
          price: order.price || 0,
          quantity: 1,
          image: order.listingImage || null,
          status: order.status
        }));
        setCartItems(items);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleRemoveItem = async (itemId) => {
    // Transactions không thể xóa, chỉ có thể thanh toán
    alert('Giao dịch không thể xóa. Vui lòng liên hệ admin nếu cần hủy.');
  };

  const handlePayOrder = async (orderId) => {
    try {
      await api.post(`/transactions/${orderId}/payment/`);
      alert('Thanh toán thành công');
      // Reload transactions
      const response = await api.get('/transactions/history');
      const orders = response.data?.data || response.data || [];
      const items = orders.map(order => ({
        id: order._id || order.id,
        name: order.listingTitle || 'Sản phẩm',
        price: order.price || 0,
        quantity: 1,
        image: order.listingImage || null,
        status: order.status
      }));
      setCartItems(items);
    } catch (err) {
      console.error('Error paying order:', err);
      alert('Không thể thanh toán: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDownloadContract = async (orderId) => {
    try {
      const response = await api.get(`/transactions/${orderId}/contract/`, {
        responseType: 'blob',
      });

      // Create blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
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
      alert('Không thể tải hợp đồng. Vui lòng kiểm tra quyền truy cập và trạng thái thanh toán.');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
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
                        >
                          ⬇️ Tải Hợp Đồng
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                  >
                    <span>Tổng:</span>
                    <span>{calculateTotal().toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-full">
                  Thanh toán
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

