import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Logo.png';

const features = [
  { icon: '🥗', title: 'Smart Food Tracking', desc: 'Log meals in plain English. AI calculates all nutrients instantly.' },
  { icon: '🎯', title: 'Personalised Targets', desc: 'Calorie and protein goals tailored to your body and lifestyle.' },
  { icon: '🤖', title: 'AI Meal Generator', desc: 'Get personalised meal suggestions based on your goals.' },
  { icon: '📊', title: 'Weekly Insights', desc: 'Track progress with detailed weekly nutrition summaries.' },
  { icon: '💧', title: 'Full Nutrition Tracking', desc: 'Monitor water, fiber, carbs and fat alongside calories.' },
  { icon: '🏋️', title: 'Exercise Integration', desc: 'Log workouts and sync them with your daily nutrition needs.' },
];

const bgImages = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80',
  'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=1600&q=80',
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % bgImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 font-sans">

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrollY > 50 ? 'bg-gray-950/95 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Diet Tracker" className="h-10 w-10 object-contain" />
            <span className="font-bold text-xl text-white tracking-wide">Diet Tracker</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-full border border-green-500 text-green-400 font-semibold hover:bg-green-500/10 transition-all duration-200">
              Sign In
            </button>
            <button onClick={() => navigate('/register')}
              className="px-6 py-2 rounded-full bg-green-500 text-white font-semibold hover:bg-green-400 transition-all duration-200 shadow-lg shadow-green-500/25">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Background Images with Crossfade */}
        {bgImages.map((img, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: i === currentBg ? 1 : 0,
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }} />
        ))}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-950/60 to-gray-950" />

        {/* Green glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-green-900/20 via-transparent to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-block bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            🚀 AI-Powered Nutrition Tracking
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-3 leading-none tracking-tight">
            Diet Tracker
          </h1>
          <p className="text-green-400 text-xl md:text-2xl font-semibold tracking-widest uppercase mb-6">
            Track . Plan . Improve
          </p>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered personal nutrition coach. Log food in plain language,
            get personalised targets, and crush your health goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')}
              className="px-10 py-4 bg-green-500 text-white text-lg font-bold rounded-full hover:bg-green-400 transition-all duration-200 shadow-xl shadow-green-500/30 hover:shadow-green-400/40 hover:scale-105">
              Get Started Free →
            </button>
            <button onClick={() => navigate('/login')}
              className="px-10 py-4 border-2 border-white/30 text-white text-lg font-bold rounded-full hover:border-white/60 hover:bg-white/10 transition-all duration-200 backdrop-blur-sm">
              Sign In
            </button>
          </div>

          {/* Image dots indicator */}
          <div className="flex justify-center gap-2 mt-12">
            {bgImages.map((_, i) => (
              <button key={i} onClick={() => setCurrentBg(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentBg ? 'w-8 h-2 bg-green-400' : 'w-2 h-2 bg-white/30'
                }`} />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <div className="w-px h-8 bg-white/20" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-green-500 py-6">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-4 text-center">
          {[
            { num: '100%', label: 'AI Powered' },
            { num: '₹0', label: 'Free Forever' },
            { num: '6+', label: 'Nutrients Tracked' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl font-black text-white">{stat.num}</div>
              <div className="text-green-100 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-green-400 text-sm font-bold tracking-widest uppercase">Features</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-2 mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Powered by AI. Designed for real results. Built for your lifestyle.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 hover:bg-gray-900/80 transition-all duration-300 group">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-green-400 text-sm font-bold tracking-widest uppercase">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-2">
              Simple as 1, 2, 3
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Enter your body stats, activity level and health goals.' },
              { step: '02', title: 'Log Your Food', desc: 'Type what you ate in plain language. AI does the rest.' },
              { step: '03', title: 'Track & Improve', desc: 'Monitor your nutrition and get AI meal suggestions daily.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-6xl font-black text-green-500/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with background image */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        <div className="absolute inset-0 bg-gray-950/80" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
            Ready to Transform<br />
            <span className="text-green-400">Your Diet?</span>
          </h2>
          <p className="text-gray-300 text-lg mb-10">
            Join and start tracking smarter with AI today. Free forever.
          </p>
          <button onClick={() => navigate('/register')}
            className="px-12 py-5 bg-green-500 text-white text-xl font-black rounded-full hover:bg-green-400 transition-all duration-200 shadow-2xl shadow-green-500/30 hover:scale-105">
            Start For Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-950 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Diet Tracker" className="h-8 w-8 object-contain" />
            <span className="text-white font-bold text-lg">Diet Tracker</span>
          </div>
          <p className="text-gray-500 text-sm">Track. Plan. Improve. <br /> <br />— Built by Pranab Kumar Agasti</p>
          <div className="flex gap-6 text-gray-500 text-sm">
            <span className="hover:text-green-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-green-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-green-400 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>

    </div>
  );
}