import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000',
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const updateGoals = (data) => API.post('/auth/update-goals', data);
export const verifyEmail = (token) => API.get(`/auth/verify?token=${token}`);
export const getUserProfile = (userId) => API.get(`/auth/user-profile/${userId}`);
export const logFood = (data) => API.post('/auth/log-food', data);
export const getDailySummary = (userId) => API.get(`/auth/daily-summary/${userId}`);
export const generateMeal = (data) => API.post('/auth/generate-meal', data);
export const getWeeklySummary = (userId) => API.get(`/auth/weekly-summary/${userId}`);
export const aiChat = (data) => API.post('/auth/ai-chat', data);