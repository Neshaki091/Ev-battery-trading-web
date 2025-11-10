import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    images: '',
    category: 'Vehicle',
    condition: 'Used',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_manufacturing_year: '',
    vehicle_mileage_km: '',
    battery_capacity_kwh: '',
    battery_condition_percentage: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('evb_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchListing();
  }, [id, navigate]);

  const fetchListing = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/listings/${id}`);
      const listing = response.data;

      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price || '',
        location: listing.location || '',
        images: listing.images ? listing.images.join(', ') : '',
        category: listing.category || 'Vehicle',
        condition: listing.condition || 'Used',
        vehicle_brand: listing.vehicle_brand || '',
        vehicle_model: listing.vehicle_model || '',
        vehicle_manufacturing_year: listing.vehicle_manufacturing_year || '',
        vehicle_mileage_km: listing.vehicle_mileage_km || '',
        battery_capacity_kwh: listing.battery_capacity_kwh || '',
        battery_condition_percentage: listing.battery_condition_percentage || '',
      });
    } catch (err) {
      setError('Không thể tải thông tin tin đăng');
      console.error('Error fetching listing:', err);
    } finally {
      setFetching(false);
    }
  };

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
      const body = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        condition: formData.condition,
        category: formData.category,
        images: formData.images ? formData.images.split(',').map(s => s.trim()) : [],
      };

      // Thêm chi tiết xe/pin nếu category khớp
      if (formData.category === 'Vehicle') {
        body.vehicle_brand = formData.vehicle_brand;
        body.vehicle_model = formData.vehicle_model;
        body.vehicle_manufacturing_year = parseInt(formData.vehicle_manufacturing_year) || undefined;
        body.vehicle_mileage_km = parseInt(formData.vehicle_mileage_km) || undefined;
      } else if (formData.category === 'Battery') {
        body.battery_capacity_kwh = parseFloat(formData.battery_capacity_kwh) || undefined;
        body.battery_condition_percentage = parseInt(formData.battery_condition_percentage) || undefined;
      }

      await api.put(`/listings/${id}`, body);
      alert('Cập nhật thành công');
      navigate(`/products/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật tin đăng');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-container">
        <div className="text-xl text-gray-600">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="card p-8" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Chỉnh sửa tin đăng</h2>

          {error && <div className="error-message mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tiêu đề *</label>
              <input
                name="title"
                type="text"
                required
                className="form-input"
                placeholder="Tiêu đề"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả chi tiết *</label>
              <textarea
                name="description"
                required
                className="form-input"
                rows="5"
                placeholder="Mô tả chi tiết"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giá (VND) *</label>
              <input
                name="price"
                type="number"
                required
                className="form-input"
                placeholder="Giá"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vị trí *</label>
              <input
                name="location"
                type="text"
                required
                className="form-input"
                placeholder="Vị trí"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL ảnh (phân tách bằng dấu phẩy)</label>
              <input
                name="images"
                type="text"
                className="form-input"
                placeholder="URL ảnh, URL ảnh, ..."
                value={formData.images}
                onChange={handleChange}
              />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Thông tin phân loại</h3>

            <div className="form-group">
              <label className="form-label">Danh mục</label>
              <select
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Vehicle">Xe Điện</option>
                <option value="Battery">Pin/Ắc Quy</option>
                <option value="Other">Linh kiện khác</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tình trạng</label>
              <select
                name="condition"
                className="form-input"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="Used">Đã qua sử dụng</option>
                <option value="New">Mới</option>
                <option value="Refurbished">Đã tân trang</option>
              </select>
            </div>

            {formData.category === 'Vehicle' && (
              <div style={{ borderTop: '1px solid #ddd', marginTop: '1rem', paddingTop: '1rem' }}>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết Xe (Vehicle)</h4>
                <div className="form-group">
                  <label className="form-label">Hãng xe</label>
                  <input
                    name="vehicle_brand"
                    type="text"
                    className="form-input"
                    placeholder="VD: VinFast, Tesla"
                    value={formData.vehicle_brand}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mẫu xe</label>
                  <input
                    name="vehicle_model"
                    type="text"
                    className="form-input"
                    placeholder="VD: VF e34, Model Y"
                    value={formData.vehicle_model}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Năm sản xuất</label>
                  <input
                    name="vehicle_manufacturing_year"
                    type="number"
                    className="form-input"
                    placeholder="Năm sản xuất"
                    value={formData.vehicle_manufacturing_year}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số KM đã đi</label>
                  <input
                    name="vehicle_mileage_km"
                    type="number"
                    className="form-input"
                    placeholder="Số KM"
                    value={formData.vehicle_mileage_km}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {formData.category === 'Battery' && (
              <div style={{ borderTop: '1px solid #ddd', marginTop: '1rem', paddingTop: '1rem' }}>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết Pin (Battery)</h4>
                <div className="form-group">
                  <label className="form-label">Dung lượng (kWh)</label>
                  <input
                    name="battery_capacity_kwh"
                    type="number"
                    step="0.1"
                    className="form-input"
                    placeholder="Dung lượng"
                    value={formData.battery_capacity_kwh}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tình trạng Pin (%)</label>
                  <input
                    name="battery_condition_percentage"
                    type="number"
                    min="0"
                    max="100"
                    className="form-input"
                    placeholder="Tình trạng (%)"
                    value={formData.battery_condition_percentage}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn"
                style={{ flex: 1, background: 'transparent', color: '#374151', border: '1px solid #d1d5db' }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditListingPage;

