import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('evb_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      setUser(response.data);
      setProfileForm({
        username: response.data.profile?.username || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('evb_user') || '{}');
      const userId = userData._id || user?.user_id;

      await api.put(`/auth/users/${userId}`, {
        username: profileForm.username,
      });

      alert('Cập nhật profile thành công');
      await fetchProfile();
      // Update localStorage user data
      const updatedUser = { ...userData, profile: { ...userData.profile, username: profileForm.username } };
      localStorage.setItem('evb_user', JSON.stringify(updatedUser));
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Lỗi khi cập nhật profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('evb_user') || '{}');
      const userId = userData._id || userData.user_id || user?.user_id;

      await api.post(`/auth/users/${userId}/change-password`, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      alert('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      localStorage.removeItem('evb_token');
      localStorage.removeItem('evb_user');
      navigate('/login');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-xl text-gray-600">Đang tải profile...</div>
      </div>
    );
  }

  const userData = JSON.parse(localStorage.getItem('evb_user') || '{}');
  const profile = user?.profile || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-1" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông tin cá nhân</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <p><strong>ID:</strong> {user?.user_id || userData._id || '—'}</p>
              <p><strong>Email:</strong> {profile.email || '—'}</p>
              <p><strong>Phone:</strong> {profile.phonenumber || '—'}</p>
              <p><strong>Username:</strong> {profile.username || '—'}</p>
              <p><strong>Role:</strong> {userData.role || 'user'}</p>
              <p><strong>Tình trạng:</strong> {userData.isActive === false ? '❌ Deactivated' : '✅ Active'}</p>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cập nhật thông tin</h3>
              {profileError && <div className="error-message mb-4">{profileError}</div>}
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Username"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn btn-primary"
                  style={{ opacity: profileLoading ? 0.5 : 1, cursor: profileLoading ? 'not-allowed' : 'pointer' }}
                >
                  {profileLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                </button>
              </form>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Đổi mật khẩu</h3>
            {passwordError && <div className="error-message mb-4">{passwordError}</div>}
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Mật khẩu cũ</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="Mật khẩu cũ"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="Mật khẩu mới"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="btn btn-primary btn-full"
                style={{ opacity: passwordLoading ? 0.5 : 1, cursor: passwordLoading ? 'not-allowed' : 'pointer' }}
              >
                {passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

