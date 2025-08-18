import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

console.log('Using API base URL:', API_BASE_URL.apiBaseUrl);

const api = axios.create({
  baseURL: API_BASE_URL.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
