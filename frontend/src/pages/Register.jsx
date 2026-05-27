import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../utils/api';
import logo from '../Logo.png';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    sex: '',
    profession: '',
    activity_level: '',
    weight_kg: '',
    height_cm: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        weight_kg: parseFloat(formData.weight_kg),
        height_cm: parseFloat(formData.height_cm),
      };
      const response = await registerUser(payload);
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('full_name', response.data.full_name);
      toast.success('Account created successfully!');
      navigate('/goals');
    } catch (error) {
      const msg = error.response?.data?.detail;
      if (Array.isArray(msg)) {
        toast.error(msg[0]?.msg || 'Validation error');
      } else {
        toast.error(msg || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-gray-500 transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-300 mb-2";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-lg my-8">

        {/* Back to home */}
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors mb-6 text-sm">
          ← Back to Home
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <img src={logo} alt="Logo" className="h-14 w-14 object-contain mx-auto mb-4" />
            <h1 className="text-3xl font-black text-white">Create Account</h1>
            <p className="text-gray-400 text-sm mt-2">Start your health journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" name="full_name" value={formData.full_name}
                onChange={handleChange} placeholder="Enter your full name" required
                className={inputClass} />
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="Enter your email" required
                className={inputClass} />
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone}
                onChange={handleChange} placeholder="Enter your phone number" required
                className={inputClass} />
            </div>

            {/* DOB and Sex */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob}
                  onChange={handleChange} required
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Sex</label>
                <select name="sex" value={formData.sex} onChange={handleChange} required
                  className={inputClass}>
                  <option value="" className="bg-gray-800">Select sex</option>
                  <option value="Male" className="bg-gray-800">Male</option>
                  <option value="Female" className="bg-gray-800">Female</option>
                  <option value="Other" className="bg-gray-800">Other</option>
                </select>
              </div>
            </div>

            {/* Profession */}
            <div>
              <label className={labelClass}>Profession</label>
              <input type="text" name="profession" value={formData.profession}
                onChange={handleChange} placeholder="e.g. Software Engineer, Student" required
                className={inputClass} />
            </div>

            {/* Activity Level */}
            <div>
              <label className={labelClass}>Activity Level</label>
              <select name="activity_level" value={formData.activity_level}
                onChange={handleChange} required className={inputClass}>
                <option value="" className="bg-gray-800">Select activity level</option>
                <option value="Sedentary" className="bg-gray-800">Sedentary — No exercise</option>
                <option value="Lightly Active" className="bg-gray-800">Lightly Active — 1-3 days/week</option>
                <option value="Moderately Active" className="bg-gray-800">Moderately Active — 3-5 days/week</option>
                <option value="Very Active" className="bg-gray-800">Very Active — 6-7 days/week</option>
                <option value="Athlete" className="bg-gray-800">Athlete — Training twice a day</option>
              </select>
            </div>

            {/* Weight and Height */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input type="number" name="weight_kg" value={formData.weight_kg}
                  onChange={handleChange} placeholder="e.g. 70" required
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Height (cm)</label>
                <input type="number" name="height_cm" value={formData.height_cm}
                  onChange={handleChange} placeholder="e.g. 175" required
                  className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={formData.password}
                  onChange={handleChange} placeholder="Min 8 characters" required
                  className={`${inputClass} pr-16`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-green-400 text-sm font-medium transition-colors">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-400 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-green-500/25 mt-2">
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-600 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Link to Login */}
            <p className="text-center text-gray-400 text-sm">
              Already have an account?{' '}
              <span onClick={() => navigate('/login')}
                className="text-green-400 font-semibold cursor-pointer hover:text-green-300 transition-colors">
                Sign In →
              </span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}