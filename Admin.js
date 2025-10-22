import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, FileText, BarChart3, LogOut, Menu, X, Save, Mail, Lock, Shield } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const storedToken = localStorage.getItem('token');
  
  const [user, setUser] = useState(storedUser);
  const [token, setToken] = useState(storedToken);
  const [activeTab, setActiveTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, total_articles: 0, total_reads: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Technology',
    tags: '',
    source: 'Admin',
    author: storedUser.name || 'Admin',
    image_url: ''
  });
  
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const isAdmin = token && user && user.role === 'admin';
  const showAdminLogin = !isAdmin;

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [activeTab, isAdmin]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role === 'admin') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setToken(data.token);
          setUser(data.user);
          setLoginError('');
        } else {
          setLoginError('Access denied. Admin privileges required.');
        }
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const fetchData = async () => {
    if (activeTab === 'articles') await fetchArticles();
    if (activeTab === 'users') await fetchUserData();
    if (activeTab === 'stats') await fetchStats();
  };

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/articles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingArticle ? 'PUT' : 'POST';
      const body = editingArticle ? { ...articleForm, id: editingArticle.id } : articleForm;

      const response = await fetch(`${API_URL}/admin/articles`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        alert(editingArticle ? 'Article updated!' : 'Article created!');
        setShowForm(false);
        setEditingArticle(null);
        setArticleForm({
          title: '',
          description: '',
          content: '',
          category: 'Technology',
          tags: '',
          source: 'Admin',
          author: user.name || 'Admin',
          image_url: ''
        });
        fetchArticles();
      }
    } catch (error) {
      alert('Error saving article: ' + error.message);
    }
  };

  const startEdit = (article) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      description: article.description,
      content: article.content,
      category: article.category,
      tags: typeof article.tags === 'string' ? article.tags : (article.tags ? article.tags.join(', ') : ''),
      source: article.source,
      author: article.author,
      image_url: article.image_url || ''
    });
    setShowForm(true);
  };

  const deleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/articles?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Article deleted!');
        fetchArticles();
      }
    } catch (error) {
      alert('Error deleting article: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Admin Login Page with Beautiful Dark Purple Gradient
  if (showAdminLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white border-opacity-20">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
              <Shield size={40} className="text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-purple-200">NewsAI Management System</p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 backdrop-blur-sm border border-red-300 border-opacity-30 rounded-lg text-red-200 text-sm">
              {loginError}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
              <input
                type="email"
                placeholder="Admin Email"
                className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-white placeholder-purple-300"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-white placeholder-purple-300"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Login as Admin
            </button>
          </form>

          {/* Back Link */}
          <div className="text-center mt-6">
            <a
              href="/"
              className="text-purple-200 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
            >
              <span>←</span> Back to Main Site
            </a>
          </div>
        </div>

        {/* Animation Styles */}
        <style>{`
          @keyframes blob {
            0%, 100% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 opacity-10"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white bg-opacity-10 backdrop-blur-md shadow-lg sticky top-0 border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-purple-200">Manage your news platform</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <span className="text-purple-100">Admin: <span className="font-semibold text-white">{user.name || 'Admin User'}</span></span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 transition-all shadow-sm border border-red-300 border-opacity-20"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-white hover:bg-opacity-10 rounded-lg text-white"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden mt-4 space-y-2">
              <a
                href="/"
                className="block w-full px-4 py-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg text-center text-white"
              >
                Back to Site
              </a>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 bg-opacity-20 text-white rounded-lg"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all shadow-lg ${
              activeTab === 'articles'
                ? 'bg-white bg-opacity-20 backdrop-blur-md text-white border-2 border-white border-opacity-30'
                : 'bg-white bg-opacity-5 backdrop-blur-sm text-purple-200 hover:bg-opacity-10 border border-white border-opacity-10'
            }`}
          >
            <FileText size={20} />
            Articles
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all shadow-lg ${
              activeTab === 'users'
                ? 'bg-white bg-opacity-20 backdrop-blur-md text-white border-2 border-white border-opacity-30'
                : 'bg-white bg-opacity-5 backdrop-blur-sm text-purple-200 hover:bg-opacity-10 border border-white border-opacity-10'
            }`}
          >
            <Users size={20} />
            Users
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all shadow-lg ${
              activeTab === 'stats'
                ? 'bg-white bg-opacity-20 backdrop-blur-md text-white border-2 border-white border-opacity-30'
                : 'bg-white bg-opacity-5 backdrop-blur-sm text-purple-200 hover:bg-opacity-10 border border-white border-opacity-10'
            }`}
          >
            <BarChart3 size={20} />
            Statistics
          </button>
        </div>

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Manage Articles</h2>
              <button
                onClick={() => {
                  setEditingArticle(null);
                  setShowForm(!showForm);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                <Plus size={20} />
                Add Article
              </button>
            </div>

            {showForm && (
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 mb-6 shadow-lg border border-white border-opacity-20">
                <h3 className="text-xl font-bold mb-4 text-white">
                  {editingArticle ? 'Edit Article' : 'Create New Article'}
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    className="w-full px-4 py-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Description"
                    className="w-full px-4 py-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    rows="3"
                    value={articleForm.description}
                    onChange={(e) => setArticleForm({ ...articleForm, description: e.target.value })}
                  />
                  <textarea
                    placeholder="Content"
                    className="w-full px-4 py-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    rows="5"
                    value={articleForm.content}
                    onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  />
                  <select
                    className="w-full px-4 py-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                  >
                    <option className="bg-purple-900">Technology</option>
                    <option className="bg-purple-900">Health</option>
                    <option className="bg-purple-900">Business</option>
                    <option className="bg-purple-900">Science</option>
                    <option className="bg-purple-900">Environment</option>
                    <option className="bg-purple-900">Politics</option>
                    <option className="bg-purple-900">Sports</option>
                    <option className="bg-purple-900">Entertainment</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tags (comma-separated)"
                    className="w-full px-4 py-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    value={articleForm.tags}
                    onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    className="w-full px-4 py-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    value={articleForm.image_url}
                    onChange={(e) => setArticleForm({ ...articleForm, image_url: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 shadow-lg"
                    >
                      <Save size={18} />
                      {editingArticle ? 'Update' : 'Create'}
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingArticle(null);
                      }}
                      className="px-6 py-2 bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-20 border border-white border-opacity-20"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white border-opacity-20">
              <table className="w-full">
                <thead className="bg-white bg-opacity-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase">Source</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-purple-200 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white divide-opacity-10">
                  {articles.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-purple-200">
                        No articles found. Click "Add Article" to create one.
                      </td>
                    </tr>
                  ) : (
                    articles.map(article => (
                      <tr key={article.id} className="hover:bg-white hover:bg-opacity-5">
                        <td className="px-6 py-4 text-sm font-medium text-white">{article.title}</td>
                        <td className="px-6 py-4 text-sm text-purple-200">{article.category}</td>
                        <td className="px-6 py-4 text-sm text-purple-200">{article.source}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => startEdit(article)}
                            className="text-blue-300 hover:text-blue-100 mr-4"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteArticle(article.id)}
                            className="text-red-300 hover:text-red-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">User Management</h2>
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white border-opacity-20">
              <table className="w-full">
                <thead className="bg-white bg-opacity-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white divide-opacity-10">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-purple-200">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className="hover:bg-white hover:bg-opacity-5">
                        <td className="px-6 py-4 text-sm font-medium text-white">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-purple-200">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-500 bg-opacity-30 text-purple-100 border border-purple-300 border-opacity-30' : 'bg-white bg-opacity-10 text-purple-200 border border-white border-opacity-20'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-purple-200">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Platform Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl border border-white border-opacity-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">TOTAL USERS</h3>
                  <Users size={32} className="opacity-80" />
                </div>
                <p className="text-5xl font-bold">{stats.total_users || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl border border-white border-opacity-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">TOTAL ARTICLES</h3>
                  <FileText size={32} className="opacity-80" />
                </div>
                <p className="text-5xl font-bold">{stats.total_articles || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl border border-white border-opacity-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">TOTAL READS</h3>
                  <BarChart3 size={32} className="opacity-80" />
                </div>
                <p className="text-5xl font-bold">{stats.total_reads || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl border border-white border-opacity-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">CATEGORIES</h3>
                  <FileText size={32} className="opacity-80" />
                </div>
                <p className="text-5xl font-bold">9</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}