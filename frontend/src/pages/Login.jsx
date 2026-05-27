import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../utils/api';
import logo from '../Logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser(formData);
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('full_name', response.data.full_name);
      localStorage.setItem('goals', JSON.stringify(response.data.goal));
      toast.success(`Welcome back, ${response.data.full_name}!`);
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.detail;
      toast.error(msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">

        {/* Back to home */}
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors mb-6 text-sm">
          ← Back to Home
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <img src={logo} alt="Logo" className="h-14 w-14 object-contain mx-auto mb-4" />
            <h1 className="text-3xl font-black text-white">Welcome Back</h1>
            <p className="text-gray-400 text-sm mt-2">Sign in to your Diet Tracker</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <input type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="Enter your email" required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-gray-500 transition-colors" />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={formData.password}
                  onChange={handleChange} placeholder="Enter your password" required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-gray-500 transition-colors pr-16" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-green-400 text-sm font-medium transition-colors">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-400 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-green-500/25 hover:shadow-green-400/30 mt-2">
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-600 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Link to Register */}
            <p className="text-center text-gray-400 text-sm">
              New to Diet Tracker?{' '}
              <span onClick={() => navigate('/register')}
                className="text-green-400 font-semibold cursor-pointer hover:text-green-300 transition-colors">
                Create Account →
              </span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}