import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    setLoading(true);

    try {
      // Endpoint theo evb_trading_platform_frontend.html
      const response = await api.post('/auth/users/login', formData);
      
      // Lưu token và user vào localStorage theo format của HTML
      if (response.data.accessToken) {
        localStorage.setItem('evb_token', response.data.accessToken);
      }
      
      // Lưu user với role và isActive
      if (response.data.user) {
        const userWithRole = {
          ...response.data.user,
          role: response.data.role,
          isActive: response.data.isActive
        };
        localStorage.setItem('evb_user', JSON.stringify(userWithRole));
      }

      // Redirect về trang chủ
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-body)', padding: '3rem 1rem' }}>
      <div className="card p-8" style={{ maxWidth: '28rem', width: '100%' }}>
        <div>
          <h2 className="text-center text-3xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>
            Đăng nhập vào tài khoản
          </h2>
          <p className="text-center text-sm" style={{ color: 'var(--text-body)' }}>
            Hoặc{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: '500' }}>
              đăng ký tài khoản mới
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
            <label htmlFor="password" style={{ display: 'none' }}>
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="form-input"
              placeholder="Mật khẩu"
              value={formData.password}
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
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

