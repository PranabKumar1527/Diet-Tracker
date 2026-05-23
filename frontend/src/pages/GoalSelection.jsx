import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updateGoals } from '../utils/api';

const GOALS = [
  { id: 'Fat Loss', label: 'Fat Loss', icon: '🔥', desc: 'Burn fat and reduce body weight' },
  { id: 'Muscle Build', label: 'Muscle Build', icon: '💪', desc: 'Build lean muscle mass' },
  { id: 'Bulking', label: 'Bulking', icon: '🏋️', desc: 'Gain mass and increase strength' },
  { id: 'Slim Fit', label: 'Slim Fit', icon: '✨', desc: 'Stay lean and toned' },
];

export default function GoalSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleGoal = (goalId) => {
    setSelected(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      toast.error('Please select at least one goal');
      return;
    }
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      toast.error('Session expired. Please register again.');
      navigate('/');
      return;
    }
    setLoading(true);
    try {
      await updateGoals({ user_id, goals: selected });
      toast.success('Goals saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600">Your Goals</h1>
          <p className="text-gray-500 mt-1">Select one or more goals</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {GOALS.map(goal => (
            <div
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`cursor-pointer rounded-xl border-2 p-4 transition duration-200 
                ${selected.includes(goal.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
                }`}
            >
              <div className="text-3xl mb-2">{goal.icon}</div>
              <div className="font-semibold text-gray-800">{goal.label}</div>
              <div className="text-sm text-gray-500 mt-1">{goal.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Complete Registration →'}
        </button>

      </div>
    </div>
  );
}