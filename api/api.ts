import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
