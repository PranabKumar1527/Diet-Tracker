import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const updateGoals = (data) => API.post('/auth/update-goals', data);
export const verifyEmail = (token) => API.get(`/auth/verify?token=${token}`);