import axios from 'axios';

// 1. Đọc biến môi trường VITE
// VITE_API_BASE_URL sẽ được lấy từ Vercel (khi deploy)
// Nó sẽ là 'undefined' khi bạn chạy 'npm run dev' (local)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Tạo axios instance dùng chung
const api = axios.create({
  // 2. SỬA LỖI TẠI ĐÂY:
  // - Nếu API_BASE_URL được định nghĩa (trên Vercel), dùng nó (vd: https://api.waterbase.click)
  // - Nếu không (chạy local), dùng '/api' để proxy của Vite (trong vite.config.js) hoạt động.
  baseURL: API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('evb_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Xóa token và redirect về login nếu unauthorized
      localStorage.removeItem('evb_token');
      localStorage.removeItem('evb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper để download file
export const downloadFile = async (url, filename) => {
  try {
    // Sửa: Đảm bảo helper cũng dùng instance 'api' đã cấu hình
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const url_blob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url_blob;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url_blob);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

export default api;