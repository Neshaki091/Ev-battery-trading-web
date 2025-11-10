import axios from 'axios';

// Đọc base URL từ biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Khi chạy 'npm run dev' (local), API_BASE_URL sẽ là undefined, 
// nên nó sẽ dùng '/api' (để proxy của Vite hoạt động)
// Khi chạy trên Vercel, nó sẽ đọc 'https://api.waterbase.click'
const apiClient = axios.create({
  baseURL: API_BASE_URL || '/api' 
});

export default apiClient;