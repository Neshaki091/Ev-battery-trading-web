import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('evb_user') || '{}');
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      <div className="container py-8">
        <div className="card p-6">
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-heading)' }}>🛡️ Admin Dashboard</h2>
          
          <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                className={activeTab === 'listings' ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => setActiveTab('listings')}
              >
                Tin chờ duyệt
              </button>
              <button
                className={activeTab === 'reports' ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => setActiveTab('reports')}
              >
                Báo cáo
              </button>
              <button
                className={activeTab === 'fees' ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => setActiveTab('fees')}
              >
                Quản lý Phí
              </button>
              <button
                className={activeTab === 'analytics' ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
              <button
                className={activeTab === 'users' ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => setActiveTab('users')}
              >
                Users
              </button>
            </div>
          </div>

          <div>
            {activeTab === 'listings' && <AdminListingsTab />}
            {activeTab === 'reports' && <AdminReportsTab />}
            {activeTab === 'fees' && <AdminFeesTab />}
            {activeTab === 'analytics' && <AdminAnalyticsTab />}
            {activeTab === 'users' && <AdminUsersTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminListingsTab() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/listings/?limit=50');
      setListings(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/listings/${id}/approve`);
      alert('Đã duyệt');
      fetchListings();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleVerify = async (id, isVerified) => {
    if (!confirm(`Xác nhận ${isVerified ? 'Gắn nhãn' : 'Gỡ nhãn'} Kiểm định?`)) return;
    try {
      await api.put(`/listings/${id}/verify`, { isVerified });
      alert('Đã cập nhật');
      fetchListings();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleHide = async (id) => {
    if (!confirm('Xác nhận Ẩn Listing?')) return;
    try {
      await api.put(`/listings/${id}`, { status: 'Hidden' });
      alert('Đã ẩn');
      fetchListings();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('CẢNH BÁO: Xác nhận XÓA VĨNH VIỄN?')) return;
    try {
      await api.delete(`/listings/${id}`);
      alert('Đã xóa');
      fetchListings();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="loading-container text-center py-8">
        <div className="loading-spinner-simple"></div>
        <p className="mt-4" style={{ color: 'var(--text-body)' }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>
        Quản lý Tin đăng ({listings.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {listings.map((listing) => {
          const listingId = listing._id || listing.id;
          return (
            <div key={listingId} style={{ borderTop: '1px solid var(--color-border)', padding: '0.5rem 0' }}>
              <strong style={{ color: 'var(--text-heading)' }}>{listing.title}</strong>
              <div style={{ color: 'var(--text-body)' }}>
                {listing.price ? `${listing.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'} (ID: {listingId})
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                {listing.status === 'Pending' && (
                  <button onClick={() => handleApprove(listingId)} className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                    ✅ Duyệt
                  </button>
                )}
                {listing.status !== 'Pending' && (
                  <>
                    <span style={{ fontSize: '0.875rem', marginRight: '0.5rem', color: 'var(--text-body)' }}>
                      Status: {listing.status}
                    </span>
                    <button onClick={() => handleHide(listingId)} className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                      Ẩn tin
                    </button>
                  </>
                )}
                {listing.isVerified ? (
                  <button onClick={() => handleVerify(listingId, false)} className="btn" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', background: 'green', color: 'white' }}>
                    ✅ Verified
                  </button>
                ) : (
                  <button onClick={() => handleVerify(listingId, true)} className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                    ❌ Set Verified
                  </button>
                )}
                <a href={`/products/${listingId}`} target="_blank" className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', textDecoration: 'none' }}>
                  👁️ Xem
                </a>
                <button onClick={() => handleDelete(listingId)} className="btn" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
                  🗑️ Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/');
      setReports(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, status) => {
    try {
      await api.put(`/reports/${id}/status`, { status });
      alert('Đã cập nhật');
      fetchReports();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="loading-container text-center py-8">
        <div className="loading-spinner-simple"></div>
        <p className="mt-4" style={{ color: 'var(--text-body)' }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>
        Báo cáo Người dùng ({reports.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {reports.map((report) => {
          const reportId = report._id || report.id;
          return (
            <div key={reportId} style={{ borderTop: '1px solid var(--color-border)', padding: '0.5rem 0' }}>
              <strong style={{ color: 'var(--text-heading)' }}>{report.subjectType} / {report.reasonCode}</strong> - Subject ID: {report.subjectId} (Status: {report.status})
              <div style={{ color: 'var(--text-body)' }}>Details: {report.details || '—'}</div>
              <div style={{ marginTop: '0.25rem' }}>
                <button
                  onClick={() => handleResolve(reportId, 'RESOLVED')}
                  disabled={report.status !== 'PENDING'}
                  className="btn btn-primary"
                  style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', opacity: report.status !== 'PENDING' ? 0.5 : 1 }}
                >
                  ✅ Resolve
                </button>
                <button
                  onClick={() => handleResolve(reportId, 'REJECTED')}
                  disabled={report.status !== 'PENDING'}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', opacity: report.status !== 'PENDING' ? 0.5 : 1 }}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminFeesTab() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ type: '', rate: '' });

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/transactions/fees/');
      setFees(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/transactions/fees/', {
        type: formData.type.toUpperCase(),
        rate: parseFloat(formData.rate),
      });
      alert('Cấu hình phí đã được tạo/cập nhật!');
      setFormData({ type: '', rate: '' });
      fetchFees();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateFee = async (id) => {
    const newRate = prompt('Nhập tỷ lệ mới (0.01 - 1.0, ví dụ: 0.05 cho 5%):');
    if (!newRate) return;

    try {
      await api.put(`/admin/transactions/fees/${id}`, {
        rate: parseFloat(newRate),
      });
      alert('Đã cập nhật');
      fetchFees();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteFee = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cấu hình phí này?')) return;
    try {
      await api.delete(`/admin/transactions/fees/${id}`);
      alert('Đã xóa');
      fetchFees();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="loading-container text-center py-8">
        <div className="loading-spinner-simple"></div>
        <p className="mt-4" style={{ color: 'var(--text-body)' }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>
        Quản lý Phí Hoa Hồng ({fees.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {fees.map((fee) => {
          const feeId = fee._id || fee.id;
          return (
            <div key={feeId} style={{ borderTop: '1px solid var(--color-border)', padding: '0.5rem 0' }}>
              <strong style={{ color: 'var(--text-heading)' }}>{fee.type}</strong>: Tỷ lệ {fee.rate * 100}% ({fee.isActive ? 'Active' : 'Inactive'})
              <div style={{ color: 'var(--text-body)' }}>ID: {feeId}</div>
              <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleUpdateFee(feeId)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => handleDeleteFee(feeId)}
                  className="btn"
                  style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}
                >
                  ❌ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>Tạo/Sửa Cấu hình Phí</h4>
      <form onSubmit={handleCreateFee} style={{ maxWidth: '400px' }}>
        <div className="form-group">
          <input
            name="type"
            required
            className="form-input"
            placeholder="Type (e.g., VEHICLE, DEFAULT)"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />
        </div>
        <div className="form-group">
          <input
            name="rate"
            type="number"
            step="0.01"
            min="0"
            max="1"
            required
            className="form-input"
            placeholder="Rate (e.g., 0.05 for 5%)"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Tạo/Cập nhật Phí
        </button>
      </form>
    </div>
  );
}

function AdminAnalyticsTab() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  // State cho bộ lọc
  const [period, setPeriod] = useState('month'); // 'today', 'week', 'month', 'year', 'all'
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12

  useEffect(() => {
    fetchAnalytics();
  }, [period, month, year]); // Fetch lại khi bất kỳ bộ lọc nào thay đổi

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/summary', {
        params: { period, month, year }
      });
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container text-center py-8">
        <div className="loading-spinner-simple"></div>
        <p className="mt-4" style={{ color: 'var(--text-body)' }}>Đang tải...</p>
      </div>
    );
  }

  if (!analytics) {
    return <p>Không thể tải dữ liệu thống kê.</p>;
  }

  // Định dạng dữ liệu cho biểu đồ
  // API mới trả về chartData và dataGrouping
  const chartData = (analytics.chartData || []).map(item => {
    const isMonthly = analytics.dataGrouping === 'monthly';
    let dateValue = item.date;
    
    // Nếu là monthly và có _id (format: 'YYYY-MM'), tạo date từ _id
    if (isMonthly && item._id && !dateValue) {
      dateValue = new Date(item._id + '-01');
    } else if (isMonthly && item._id) {
      // Nếu có cả _id và date, ưu tiên date nhưng đảm bảo nó là Date object
      dateValue = dateValue instanceof Date ? dateValue : new Date(dateValue);
    } else {
      dateValue = dateValue ? new Date(dateValue) : new Date();
    }
    
    return {
      ...item,
      // Format date '13/11' (daily) hoặc '11/2025' (monthly)
      dateLabel: dateValue.toLocaleDateString('vi-VN', {
        day: isMonthly ? undefined : '2-digit',
        month: '2-digit',
        year: isMonthly ? 'numeric' : undefined
      })
    };
  });

  const summary = analytics.summary || {};

  // Tạo danh sách năm (từ năm hiện tại trở về trước 5 năm)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>Thống kê</h3>

      {/* Bộ lọc */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Chọn Period */}
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)} 
          className="form-input"
          style={{ minWidth: '150px' }}
        >
          <option value="today">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="month">Theo Tháng</option>
          <option value="year">Theo Năm</option>
          <option value="all">Từ trước đến giờ</option>
        </select>

        {/* Chọn Tháng (chỉ hiển thị khi period='month') */}
        {period === 'month' && (
          <select 
            value={month} 
            onChange={(e) => setMonth(parseInt(e.target.value))} 
            className="form-input"
            style={{ minWidth: '120px' }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
        )}

        {/* Chọn Năm (hiển thị khi period='month' hoặc 'year') */}
        {(period === 'month' || period === 'year') && (
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))} 
            className="form-input"
            style={{ minWidth: '120px' }}
          >
            {years.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Hiển thị các thẻ tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Tổng Doanh Thu (Hoa hồng)" 
          value={summary.totalCommission?.toLocaleString('vi-VN') + ' đ'} 
        />
        <StatCard 
          title="Tổng GT Giao dịch" 
          value={summary.totalRevenue?.toLocaleString('vi-VN') + ' đ'} 
        />
        <StatCard 
          title="Người Dùng Mới" 
          value={summary.totalNewUsers?.toLocaleString('vi-VN')} 
        />
        <StatCard 
          title="Tin Đăng Mới" 
          value={summary.totalNewListings?.toLocaleString('vi-VN')} 
        />
      </div>

      {/* Vẽ 4 Biểu đồ riêng biệt */}
      <h3 className="text-xl font-bold mb-4 mt-8" style={{ color: 'var(--text-heading)' }}>Biểu đồ Xu hướng</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Biểu đồ 1: Doanh thu (Hoa hồng) */}
        <ChartBox title="Doanh thu (Hoa hồng)">
          <ReusableAnalyticsChart data={chartData} dataKey="totalCommission" color="#8884d8" />
        </ChartBox>

        {/* Biểu đồ 2: Tổng GT Giao dịch (totalRevenue) */}
        <ChartBox title="Tổng Giá trị Giao dịch">
          <ReusableAnalyticsChart data={chartData} dataKey="totalRevenue" color="#ff7300" />
        </ChartBox>

        {/* Biểu đồ 3: Người dùng mới */}
        <ChartBox title="Người dùng mới">
          <ReusableAnalyticsChart data={chartData} dataKey="newUsers" color="#82ca9d" />
        </ChartBox>

        {/* Biểu đồ 4: Tin đăng mới */}
        <ChartBox title="Tin đăng mới">
          <ReusableAnalyticsChart data={chartData} dataKey="newListings" color="#ffc658" />
        </ChartBox>
      </div>

    </div>
  );
}

// Component phụ: StatCard
function StatCard({ title, value }) {
  return (
    <div style={{ 
      background: 'var(--bg-muted)', 
      padding: '1rem', 
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)'
    }}>
      <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>
        {title}
      </h4>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
        {value || 0}
      </p>
    </div>
  );
}

// Component bọc (wrapper) cho biểu đồ
function ChartBox({ title, children }) {
  return (
    <div style={{ 
      background: 'var(--bg-muted)', 
      padding: '1rem', 
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)'
    }}>
      <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
        {title}
      </h4>
      <div style={{ width: '100%', height: 300 }}>
        {children}
      </div>
    </div>
  );
}

// Component biểu đồ tái sử dụng
function ReusableAnalyticsChart({ data, dataKey, color }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart 
        data={data} 
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="dateLabel" stroke="var(--text-body)" />
        <YAxis 
          stroke="var(--text-body)"
          tickFormatter={(value) => 
            value > 1000000 ? `${value / 1000000}tr` : (value > 1000 ? `${value / 1000}k` : value)
          }
        />
        <Tooltip 
          contentStyle={{ 
            background: 'var(--bg-popover)', 
            borderColor: 'var(--border-color)' 
          }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          dot={false} 
          strokeWidth={2} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AdminUsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      setUsers(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, field, value) => {
    try {
      const updateData = {};
      if (field === 'role') {
        updateData.role = value;
      } else if (field === 'isActive') {
        updateData.isActive = value === 'true' || value === true;
      } else if (field === 'username') {
        updateData.username = value;
      }

      await api.put(`/auth/users/${userId}`, updateData);
      alert('Đã cập nhật');
      fetchUsers();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('CẢNH BÁO: Xác nhận XÓA VĨNH VIỄN user này?')) return;

    try {
      await api.delete(`/auth/users/${userId}`);
      alert('User đã bị xóa');
      fetchUsers();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="loading-container text-center py-8">
        <div className="loading-spinner-simple"></div>
        <p className="mt-4" style={{ color: 'var(--text-body)' }}>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container text-center py-8">
        <h3 className="text-xl font-semibold" style={{ color: 'var(--color-danger)' }}>
          Lỗi: {error}
        </h3>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>Quản lý Người dùng ({users.length})</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Username</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const userId = user._id || user.id;
              const profile = user.profile || {};
              return (
                <tr key={userId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem' }}>{userId}</td>
                  <td style={{ padding: '0.75rem' }}>{profile.email || '—'}</td>
                  <td style={{ padding: '0.75rem' }}>{profile.phonenumber || '—'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <input
                      type="text"
                      defaultValue={profile.username || ''}
                      onBlur={(e) => {
                        if (e.target.value !== profile.username) {
                          handleUpdateUser(userId, 'username', e.target.value);
                        }
                      }}
                      className="form-input"
                      style={{ width: '150px', padding: '0.25rem 0.5rem' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => handleUpdateUser(userId, 'role', e.target.value)}
                      className="form-input"
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <select
                      value={user.isActive === false ? 'false' : 'true'}
                      onChange={(e) => handleUpdateUser(userId, 'isActive', e.target.value)}
                      className="form-input"
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      <option value="true">Active</option>
                      <option value="false">Deactivated</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => handleDeleteUser(userId)}
                      className="btn"
                      style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

