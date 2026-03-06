import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ updated for real device testing
// PC IP: 192.168.0.226
export const BASE_URL = 'http://192.168.0.226:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;