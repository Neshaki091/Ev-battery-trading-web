import api from './api';

// Tạo hoặc lấy phòng chat giữa user hiện tại và người nhận
export const createOrGetRoom = (receiverId) =>
  api.post('/chat/rooms', { receiverId }).then((res) => res.data);

// Lấy danh sách phòng chat của user hiện tại
export const fetchUserRooms = () =>
  api.get('/chat/rooms').then((res) => res.data);

// Lấy danh sách tin nhắn của một phòng
export const fetchMessages = (roomId, params = {}) =>
  api
    .get(`/chat/rooms/${roomId}/messages`, { params })
    .then((res) => res.data);

// Gửi tin nhắn vào phòng
export const sendMessage = (roomId, text) =>
  api
    .post(`/chat/rooms/${roomId}/messages`, { text })
    .then((res) => res.data);

// Lấy notifications (tin nhắn mới nhất từ các phòng)
export const fetchNotifications = (params = {}) =>
  api.get('/chat/notifications', { params }).then((res) => res.data);


