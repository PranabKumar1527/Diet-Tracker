import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import logo from '../Logo.png';
import FoodLibrary from '../components/FoodLibrary';
import {
  getUserProfile,
  logFood,
  getDailySummary,
  generateMeal,
  getWeeklySummary,
  aiChat
} from '../utils/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [targets, setTargets] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [foodInput, setFoodInput] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [loading, setLoading] = useState(false);
  const [mealSuggestion, setMealSuggestion] = useState('');
  const [mealGenType, setMealGenType] = useState('Breakfast');
  const [specialNotes, setSpecialNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hi! I am your AI nutrition assistant. Ask me anything about your diet, nutrition, or health goals!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const userId = localStorage.getItem('user_id');
  const fullName = localStorage.getItem('full_name');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadDashboard = async () => {
    try {
      const [profileRes, summaryRes, weeklyRes] = await Promise.all([
        getUserProfile(userId),
        getDailySummary(userId),
        getWeeklySummary(userId)
      ]);
      setProfile(profileRes.data.user);
      setTargets(profileRes.data.targets);
      setDailySummary(summaryRes.data);
      setWeeklySummary(weeklyRes.data.weekly_data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    }
  };

  const handleLogFood = async () => {
    if (!foodInput.trim()) {
      toast.error('Please describe what you ate');
      return;
    }
    setLoading(true);
    try {
      await logFood({
        user_id: userId,
        food_description: foodInput,
        meal_type: mealType
      });
      toast.success('Food logged successfully!');
      setFoodInput('');
      await loadDashboard();
    } catch (error) {
      toast.error('Failed to log food');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMeal = async () => {
    setGenerating(true);
    setMealSuggestion('');
    try {
      const res = await generateMeal({
        user_id: userId,
        meal_type: mealGenType,
        special_notes: specialNotes
      });
      setMealSuggestion(res.data.suggestion);
    } catch (error) {
      toast.error('Failed to generate meal');
    } finally {
      setGenerating(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await aiChat({ user_id: userId, message: userMsg });
      setChatMessages(prev => [...prev, { role: 'ai', text: res.data.response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I could not process that. Try again!' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getProgress = (consumed, target) => {
    if (!target) return 0;
    return Math.min((consumed / target) * 100, 100);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const consumed = dailySummary?.total || {};
  const tabs = ['dashboard', 'nutrition', 'meals', 'exercise'];

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold text-green-400">Diet Tracker</span>
          </div>

          {/* Tabs */}
          <div className="hidden md:flex gap-1">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-green-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}>
                {tab === 'nutrition' ? 'Nutrition Tracker' :
                 tab === 'meals' ? 'Food & Meals' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm hidden md:block">{fullName}</span>
            <button onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 text-sm transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">

            {/* Greeting */}
            <div>
              <h1 className="text-3xl font-black text-white">
                {getGreeting()}, <span className="text-green-400">{fullName?.split(' ')[0]}!</span>
              </h1>
              <p className="text-gray-400 mt-1">Here's your nutrition summary for today.</p>
            </div>

            {/* Today's Intake Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Calories', consumed: consumed.calories || 0, target: targets?.calories || 2000, unit: 'kcal', color: 'green' },
                { label: 'Protein', consumed: consumed.protein_gm || 0, target: targets?.protein_gm || 150, unit: 'g', color: 'blue' },
                { label: 'Water', consumed: (consumed.water_ml || 0) / 1000, target: targets?.water_ltr || 2.5, unit: 'L', color: 'cyan' },
                { label: 'Fiber', consumed: consumed.fiber_gm || 0, target: targets?.fiber_gm || 30, unit: 'g', color: 'yellow' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-gray-400 text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-gray-500">{item.unit}</span>
                  </div>
                  <div className="text-2xl font-black text-white mb-1">
                    {typeof item.consumed === 'number' ? item.consumed.toFixed(item.unit === 'L' ? 1 : 0) : 0}
                    <span className="text-gray-500 text-sm font-normal"> / {item.target}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${getProgress(item.consumed, item.target)}%`,
                        backgroundColor: item.color === 'green' ? '#22c55e' :
                                         item.color === 'blue' ? '#3b82f6' :
                                         item.color === 'cyan' ? '#06b6d4' : '#eab308'
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getProgress(item.consumed, item.target).toFixed(0)}% of daily goal
                  </div>
                </div>
              ))}
            </div>

            {/* Log Food */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">🍽️ Log Your Food</h2>
              <div className="flex flex-col md:flex-row gap-3">
                <select value={mealType} onChange={e => setMealType(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 md:w-48">
                  {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Brunch', 'Miscellaneous'].map(m => (
                    <option key={m} value={m} className="bg-gray-800">{m}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={foodInput}
                  onChange={e => setFoodInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleLogFood()}
                  placeholder="What did you eat? e.g. 2 rotis with dal and curd"
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 placeholder-gray-500"
                />
                <button onClick={handleLogFood} disabled={loading}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-400 transition-all disabled:opacity-50 whitespace-nowrap">
                  {loading ? 'Analysing...' : 'Track Intake'}
                </button>
              </div>
            </div>

            {/* Today's Logs */}
            {dailySummary?.logs?.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">📋 Today's Food Log</h2>
                <div className="space-y-3">
                  {dailySummary.logs.map((log, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-semibold mr-2">
                          {log.meal_type}
                        </span>
                        <span className="text-white text-sm">{log.food_description}</span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>🔥 {log.calories?.toFixed(0)} kcal</span>
                        <span>💪 {log.protein_gm?.toFixed(1)}g protein</span>
                      </div>
                    </div>
                  ))}
                </div>
                {dailySummary?.logs?.[dailySummary.logs.length - 1]?.ai_review && (
                  <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <p className="text-green-400 text-sm font-semibold mb-1">🤖 Diet Tracker review</p>
                    <p className="text-gray-300 text-sm">
                      {dailySummary.logs[dailySummary.logs.length - 1].ai_review}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Weekly Summary */}
            {weeklySummary && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">📅 This Week's Summary</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-800">
                        <th className="text-left py-2 pr-4">Day</th>
                        <th className="text-right py-2 px-4">Calories</th>
                        <th className="text-right py-2 px-4">Protein</th>
                        <th className="text-right py-2 px-4">Meals Logged</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklySummary.map((day, i) => (
                        <tr key={i}
                          className={`border-b border-gray-800/50 ${
                            day.date === new Date().toISOString().split('T')[0]
                              ? 'bg-green-500/5'
                              : ''
                          }`}>
                          <td className={`py-3 pr-4 font-semibold ${
                            day.date === new Date().toISOString().split('T')[0]
                              ? 'text-green-400'
                              : 'text-white'
                          }`}>
                            {day.day}
                            {day.date === new Date().toISOString().split('T')[0] && (
                              <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Today</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-300">
                            {day.calories > 0 ? `${day.calories} kcal` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-300">
                            {day.protein_gm > 0 ? `${day.protein_gm}g` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-300">
                            {day.logs_count > 0 ? day.logs_count : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NUTRITION TRACKER TAB */}
        {activeTab === 'nutrition' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-black text-white">Nutrition Tracker</h1>

            {/* Detailed breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Macros breakdown */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Today's Macros</h2>
                {[
                  { label: 'Calories', value: consumed.calories || 0, target: targets?.calories || 2000, unit: 'kcal', color: '#22c55e' },
                  { label: 'Protein', value: consumed.protein_gm || 0, target: targets?.protein_gm || 150, unit: 'g', color: '#3b82f6' },
                  { label: 'Carbs', value: consumed.carbs_gm || 0, target: (targets?.calories || 2000) * 0.5 / 4, unit: 'g', color: '#f97316' },
                  { label: 'Fat', value: consumed.fat_gm || 0, target: (targets?.calories || 2000) * 0.25 / 9, unit: 'g', color: '#eab308' },
                  { label: 'Fiber', value: consumed.fiber_gm || 0, target: targets?.fiber_gm || 30, unit: 'g', color: '#8b5cf6' },
                ].map((item, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 font-medium">{item.label}</span>
                      <span className="text-gray-400">
                        {item.value.toFixed(1)} / {item.target.toFixed(0)} {item.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((item.value / item.target) * 100, 100)}%`,
                          backgroundColor: item.color
                        }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Personal targets */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Your Daily Targets</h2>
                {targets && (
                  <div className="space-y-3">
                    {[
                      { label: 'Daily Calories', value: `${targets.calories} kcal`, icon: '🔥' },
                      { label: 'Protein', value: `${targets.protein_gm}g`, icon: '💪' },
                      { label: 'Water', value: `${targets.water_ltr}L`, icon: '💧' },
                      { label: 'Fiber', value: `${targets.fiber_gm}g`, icon: '🌾' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-800 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-gray-300 font-medium">{item.label}</span>
                        </div>
                        <span className="text-green-400 font-bold">{item.value}</span>
                      </div>
                    ))}
                    {profile && (
                      <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm font-semibold">📊 Based on your profile</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {profile.weight_kg}kg • {profile.height_cm}cm • {profile.activity_level} • Goals: {profile.goal?.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MEALS TAB */}
        {activeTab === 'meals' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-black text-white">Food & Meals</h1>

            {/* Food Library */}
            <FoodLibrary userId={userId} />

            {/* AI Meal Generator */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-1">🤖 Diet Meal Generator</h2>
              <p className="text-gray-400 text-sm mb-4">Get personalised meal suggestions based on your goals.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Meal Type</label>
                  <select value={mealGenType} onChange={e => setMealGenType(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Brunch', 'Miscellaneous'].map(m => (
                      <option key={m} value={m} className="bg-gray-800">{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Special Notes</label>
                  <input type="text" value={specialNotes} onChange={e => setSpecialNotes(e.target.value)}
                    placeholder="e.g. vegetarian, no dairy, quick recipe"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 placeholder-gray-500" />
                </div>
              </div>
              <button onClick={handleGenerateMeal} disabled={generating}
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-400 transition-all disabled:opacity-50">
                {generating ? '⏳ Generating...' : '✨ Generate My Meal'}
              </button>

              {mealSuggestion && (
                <div className="mt-6 bg-gray-800 rounded-xl p-5">
                  <p className="text-green-400 font-semibold mb-3">🍽️ Your {mealGenType} Suggestion</p>
                  <p className="text-gray-300 text-sm leading-relaxed" style={{fontFamily: 'Georgia, serif'}}>
                    {mealSuggestion}
                  </p>
                </div>
              )}
            </div>

            {/* AI Chat */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">💬 Your Nutrition Assistant</h2>
              <div className="bg-gray-800 rounded-xl p-4 h-64 overflow-y-auto mb-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md rounded-xl px-4 py-2 text-sm leading-relaxed ${
                      msg.role === 'user' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-200'
                    }`} style={{fontFamily: msg.role === 'ai' ? 'Georgia, serif' : 'inherit'}}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 rounded-xl px-4 py-2 text-sm text-gray-400">Thinking...</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-3">
                <input type="text" value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleChat()}
                  placeholder="Ask about nutrition, diet tips, recipes..."
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 placeholder-gray-500" />
                <button onClick={handleChat} disabled={chatLoading}
                  className="bg-green-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-green-400 transition-all disabled:opacity-50">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EXERCISE TAB */}
        {activeTab === 'exercise' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-black text-white">Exercise</h1>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
              <div className="text-6xl mb-4">🏋️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Exercise Tracker</h2>
              <p className="text-gray-400">Coming soon — log workouts and sync with nutrition targets.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}