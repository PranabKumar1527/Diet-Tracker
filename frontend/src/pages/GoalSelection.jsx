import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updateGoals } from '../utils/api';
import logo from '../Logo.png';

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
      toast.success('Goals saved! Welcome to Diet Tracker 🎉');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-lg">

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <img src={logo} alt="Logo" className="h-14 w-14 object-contain mx-auto mb-4" />
            <h1 className="text-3xl font-black text-white">Your Goals</h1>
            <p className="text-gray-400 text-sm mt-2">
              Select one or more goals. You can always change these later.
            </p>
          </div>

          {/* Goal Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {GOALS.map(goal => (
              <div key={goal.id} onClick={() => toggleGoal(goal.id)}
                className={`cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 
                  ${selected.includes(goal.id)
                    ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}>
                <div className="text-3xl mb-3">{goal.icon}</div>
                <div className={`font-bold text-base mb-1 ${selected.includes(goal.id) ? 'text-green-400' : 'text-white'}`}>
                  {goal.label}
                </div>
                <div className="text-xs text-gray-400 leading-relaxed">{goal.desc}</div>
                {selected.includes(goal.id) && (
                  <div className="mt-2 text-green-400 text-xs font-bold">✓ Selected</div>
                )}
              </div>
            ))}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading || selected.length === 0}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-400 transition-all duration-200 disabled:opacity-40 shadow-lg shadow-green-500/25">
            {loading ? 'Saving...' : `Complete Setup →`}
          </button>

          {selected.length > 0 && (
            <p className="text-center text-gray-500 text-xs mt-3">
              {selected.length} goal{selected.length > 1 ? 's' : ''} selected
            </p>
          )}

        </div>
      </div>
    </div>
  );
}