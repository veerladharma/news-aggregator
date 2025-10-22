import React, { useState, useEffect } from 'react';
import { Search, Heart, Bookmark, Share2, User, LogOut, Menu, X, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function NewsAggregator() {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token');
    return stored && stored !== 'undefined' ? stored : null;
  });
  
  const [storedUser, setStoredUser] = useState(() => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData || userData === 'undefined' || userData === 'null') {
        return {};
      }
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  });

  const [articles, setArticles] = useState([]);
  const [categories] = useState(['For You', 'All', 'Technology', 'Health', 'Business', 'Science', 'Environment', 'Politics', 'Sports', 'Cricket', 'Entertainment']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [preferences, setPreferences] = useState({ interests: [], preferred_sources: [] });
  const [showPreferences, setShowPreferences] = useState(false);
  const [liveNews, setLiveNews] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });

  useEffect(() => {
    if (token) {
      fetchPreferences();
      fetchArticles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchArticles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, liveNews, searchQuery]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`${API_URL}/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (activeCategory === 'For You') {
        if (preferences.interests && preferences.interests.length > 0) {
          params.append('search', preferences.interests[0]);
        } else {
          params.append('search', 'news');
        }
        params.append('fetch_live', 'true');
      } else {
        if (activeCategory !== 'All') params.append('category', activeCategory);
        if (searchQuery) params.append('search', searchQuery);
        if (liveNews) params.append('fetch_live', 'true');
      }

      const response = await fetch(`${API_URL}/articles?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (authView === 'forgot') {
      alert('Password reset link sent to ' + authForm.email + '\n(Feature coming soon!)');
      setAuthView('login');
      return;
    }
    
    const endpoint = authView === 'login' ? '/login' : '/register';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();

      if (response.ok) {
        if (authView === 'login') {
          setToken(data.token);
          setStoredUser(data.user);
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          setAuthView('login');
          alert('Registration successful! Please login.');
        }
      } else {
        alert(data.message || 'Authentication failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setStoredUser({});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleInteraction = async (articleId, type) => {
    try {
      console.log('Sending interaction:', { article_id: articleId || 0, type });
      
      const response = await fetch(`${API_URL}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          article_id: articleId || 0,
          type: type 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Interaction recorded:', data);
        const messages = {
          like: 'Liked!',
          bookmark: 'Bookmarked!',
          share: 'Shared!'
        };
        alert(messages[type] + ' Interaction saved to database.');
      } else {
        console.error('Failed to record interaction:', data);
      }
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const updatePreferences = async () => {
    try {
      const response = await fetch(`${API_URL}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });
      
      if (response.ok) {
        setShowPreferences(false);
        alert('Preferences saved! They will be used for "For You" recommendations.');
        fetchArticles();
      } else {
        alert('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Error saving preferences');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
          <div className="text-white space-y-6 z-10">
            <h1 className="text-6xl font-bold">NewsAI</h1>
            <p className="text-2xl font-light">Your Personalized News Hub</p>
            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🌍</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">Global Coverage</p>
                  <p className="text-sm text-purple-200">40+ news sources worldwide</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">AI-Powered</p>
                  <p className="text-sm text-purple-200">Personalized recommendations</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">Real-time Updates</p>
                  <p className="text-sm text-purple-200">Breaking news as it happens</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
          <div className="w-full max-w-md z-10">
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">NewsAI</h1>
              <p className="text-purple-200">Your Personalized News Hub</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white border-opacity-20">
              <div className="mb-8">
                {authView === 'forgot' && (
                  <button
                    onClick={() => setAuthView('login')}
                    className="flex items-center gap-2 text-purple-200 hover:text-white mb-4"
                  >
                    <ArrowLeft size={20} />
                    Back to Login
                  </button>
                )}
                <h2 className="text-3xl font-bold text-white">
                  {authView === 'login' && 'Welcome Back'}
                  {authView === 'register' && 'Create Account'}
                  {authView === 'forgot' && 'Reset Password'}
                </h2>
                <p className="text-purple-200 mt-2">
                  {authView === 'login' && 'Enter your credentials to access your account'}
                  {authView === 'register' && 'Sign up to start reading personalized news'}
                  {authView === 'forgot' && "Enter your email and we'll send you a reset link"}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                {authView === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Full Name</label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                {authView !== 'forgot' && (
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                {authView === 'login' && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-purple-200">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthView('forgot')}
                      className="text-purple-200 hover:text-white font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg"
                >
                  {authView === 'login' && 'Sign In'}
                  {authView === 'register' && 'Create Account'}
                  {authView === 'forgot' && 'Send Reset Link'}
                </button>
              </form>

              {authView !== 'forgot' && (
                <div className="mt-6 text-center">
                  <p className="text-purple-200">
                    {authView === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}
                      className="text-white hover:text-purple-100 font-semibold"
                    >
                      {authView === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <header className="bg-white bg-opacity-90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📰</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">NewsAI</h1>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-700">Welcome, <span className="font-semibold">{storedUser.name || 'User'}</span></span>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                <User size={18} />
                Preferences
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden mt-4 space-y-2">
              <button
                onClick={() => { setShowPreferences(!showPreferences); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg"
              >
                <User size={18} />
                Preferences
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Your Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Interests (comma-separated)
                  <span className="text-gray-500 text-xs ml-2">Used for "For You" feed</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={preferences.interests.join(', ')}
                  onChange={(e) => setPreferences({ ...preferences, interests: e.target.value.split(',').map(i => i.trim()) })}
                  placeholder="e.g., Technology, Health, Sports"
                />
                {preferences.interests.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Your "For You" feed will show: {preferences.interests[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Sources (comma-separated)
                  <span className="text-gray-500 text-xs ml-2">Optional</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={preferences.preferred_sources.join(', ')}
                  onChange={(e) => setPreferences({ ...preferences, preferred_sources: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="e.g., BBC, CNN, TechCrunch"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={updatePreferences}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setLiveNews(!liveNews)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${
              liveNews 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Live {liveNews ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shadow-sm ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category}
              {category === 'For You' && preferences.interests.length > 0 && (
                <span className="ml-1 text-xs opacity-90">({preferences.interests.slice(0, 2).join(', ')})</span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">
              {activeCategory === 'For You' 
                ? `Loading personalized ${preferences.interests[0] || 'news'}...` 
                : 'Loading articles...'}
            </p>
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            {activeCategory === 'For You' && preferences.interests.length === 0 ? (
              <div className="p-8">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">👋</span>
                </div>
                <p className="text-gray-800 text-xl font-semibold mb-2">Welcome to your personalized feed!</p>
                <p className="text-gray-500 mb-6">Set your preferences to see news tailored to your interests.</p>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Set Preferences Now
                </button>
              </div>
            ) : (
              <p className="text-gray-600 text-lg p-8">No articles found. Try enabling Live News or adjusting your filters.</p>
            )}
          </div>
        )}

        {!loading && articles.length > 0 && (
          <div>
            {activeCategory === 'For You' && (
              <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border-l-4 border-indigo-600">
                <p className="text-indigo-800 font-medium">
                  Showing personalized news for: <span className="font-bold">{preferences.interests.join(', ') || 'General'}</span>
                </p>
                <p className="text-indigo-600 text-sm mt-1">
                  Based on your saved preferences. <button onClick={() => setShowPreferences(true)} className="underline font-semibold">Update preferences</button>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <img
                    src={article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop';
                    }}
                  />
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500">{article.source}</span>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInteraction(article.id || idx, 'like')}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors"
                          title="Like"
                        >
                          <Heart size={18} className="text-gray-600 hover:text-red-500" />
                        </button>
                        <button
                          onClick={() => handleInteraction(article.id || idx, 'bookmark')}
                          className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                          title="Bookmark"
                        >
                          <Bookmark size={18} className="text-gray-600 hover:text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleInteraction(article.id || idx, 'share')}
                          className="p-2 hover:bg-green-50 rounded-full transition-colors"
                          title="Share"
                        >
                          <Share2 size={18} className="text-gray-600 hover:text-green-500" />
                        </button>
                      </div>
                      
                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                        >
                          Read More
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {storedUser.role === 'admin' && (
        <div className="fixed bottom-6 right-6">
          <a
            href="/admin"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
          >
            Admin Panel
          </a>
        </div>
      )}
    </div>
  );
}