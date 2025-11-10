import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    phonenumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      // Endpoint theo evb_trading_platform_frontend.html
      const response = await api.post('/auth/users', {
        email: formData.email,
        phonenumber: formData.phonenumber,
        password: formData.password,
      });

      // Redirect về trang login sau khi đăng ký thành công
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
            Đăng ký tài khoản mới
          </h2>
          <p className="text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link to="/login" className="text-blue-600" style={{ fontWeight: '500' }}>
              đăng nhập nếu đã có tài khoản
            </Link>
          </p>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="email" style={{ display: 'none' }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="Địa chỉ email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phonenumber" style={{ display: 'none' }}>
              Số điện thoại
            </label>
            <input
              id="phonenumber"
              name="phonenumber"
              type="tel"
              required
              className="form-input"
              placeholder="Số điện thoại"
              value={formData.phonenumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" style={{ display: 'none' }}>
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="form-input"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" style={{ display: 'none' }}>
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="form-input"
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{ opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;

