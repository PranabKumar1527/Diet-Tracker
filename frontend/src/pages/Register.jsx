import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../utils/api';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      toast.success('Registration successful! Check your email.');
      navigate('/verify');
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600">Diet Tracker</h1>
          <p className="text-gray-500 mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Sex */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sex
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Profession */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profession
            </label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              placeholder="e.g. Software Engineer, Student"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Level
            </label>
            <select
              name="activity_level"
              value={formData.activity_level}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select activity level</option>
              <option value="Sedentary">Sedentary — No exercise</option>
              <option value="Lightly Active">Lightly Active — 1-3 days/week</option>
              <option value="Moderately Active">Moderately Active — 3-5 days/week</option>
              <option value="Very Active">Very Active — 6-7 days/week</option>
              <option value="Athlete">Athlete — Training twice a day</option>
            </select>
          </div>

          {/* Weight and Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleChange}
                placeholder="e.g. 70"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleChange}
                placeholder="e.g. 175"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 disabled:opacity-50 mt-4"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>

        </form>
      </div>
    </div>
  );
}