import api from './api';

export const authService = {
  sendVerificationCode: (email) => api.post('/auth/send-verification', { email }),
  verifyCode: (email, code) => api.post('/auth/verify-code', { email, code }),
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/update', data),
};

export default authService;