import React, { useState, useEffect, useRef } from 'react';
import { Upload, Search, Image as ImageIcon, Sparkles, Loader2, ArrowRight, Link as LinkIcon, Mail, Lock, User, Github, Bell, MessageCircle, ChevronDown, MoreHorizontal, Share, Download, EyeOff, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Masonry from 'react-masonry-css';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000';

function App() {
  const [images, setImages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [exploreImages, setExploreImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('landing'); // Start with landing page
  const [urlInput, setUrlInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [relatedPins, setRelatedPins] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [searchHistory, setSearchHistory] = useState(() => {
    const history = localStorage.getItem('visulens_history');
    return history ? JSON.parse(history) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { text: "Hi! How can I help you find inspiration today?", isBot: true }
  ]);
  const [chatInput, setChatInput] = useState('');

  const sendChatMessage = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { text: chatInput, isBot: false };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulate bot response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        text: "That sounds interesting! I'll keep that in mind for your searches.",
        isBot: true
      }]);
    }, 1000);
  };
  const [showUserMenu, setShowUserMenu] = useState(false);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setNotificationHistory(prev => [{ id, message, type, time: new Date() }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const [savedPins, setSavedPins] = useState(() => {
    const saved = localStorage.getItem('visulens_saved');
    return saved ? JSON.parse(saved) : [];
  });
  const [hiddenPins, setHiddenPins] = useState([]);

  useEffect(() => {
    localStorage.setItem('visulens_saved', JSON.stringify(savedPins));
  }, [savedPins]);

  useEffect(() => {
    localStorage.setItem('visulens_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    fetchImages();
  }, []);

  const [backendWaking, setBackendWaking] = useState(false);

  const fetchImages = async (retryCount = 0) => {
    try {
      const imagesRes = await axios.get(`${API_BASE}/images`, { timeout: 15000 });
      const allImages = imagesRes.data.images || [];
      setImages(allImages);
      setBackendWaking(false);

      // Shuffle for the Explore view
      const shuffled = [...allImages].sort(() => 0.5 - Math.random());
      setExploreImages(shuffled.slice(0, 60));

      // Background sync without blocking the UI
      axios.post(`${API_BASE}/sync`).catch(err => console.error("Sync failed", err));
    } catch (err) {
      if (retryCount < 5) {
        setBackendWaking(true);
        console.log(`Backend not ready, retrying in 8s... (attempt ${retryCount + 1}/5)`);
        setTimeout(() => fetchImages(retryCount + 1), 8000);
      } else {
        setBackendWaking(false);
        console.error("Backend unavailable after retries:", err);
      }
    }
  };

  const addToHistory = (query) => {
    if (!query) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h !== query);
      return [query, ...filtered].slice(0, 10);
    });
  };

  const handleSearchResponse = (results, queryLabel) => {
    setSearchResults(results);
    setCurrentView('results');
    setLoading(false);
    addToHistory(queryLabel);
  };

  const checkAuth = (action) => {
    if (!isLoggedIn) {
      setCurrentView('signin');
      return false;
    }
    return true;
  };

  const onDrop = async (acceptedFiles) => {
    if (!checkAuth("upload and search")) return;

    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setCurrentView('results');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${API_BASE}/search`, formData);
      handleSearchResponse(response.data.results, `Image: ${file.name}`);
    } catch (err) {
      console.error("Error searching file", err);
      setLoading(false);
    }
  };

  const onUrlSearch = async (e) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setCurrentView('results');
    setShowHistory(false);

    try {
      const response = await axios.post(`${API_BASE}/search-url`, { url: urlInput });
      handleSearchResponse(response.data.results, urlInput);
    } catch (err) {
      console.error("Error searching URL", err);
      setLoading(false);
    }
  };

  const onDatasetDrop = async (acceptedFiles) => {
    if (!checkAuth("contribute to the dataset")) return;

    setUploadProgress(acceptedFiles.map(f => ({ name: f.name, status: 'pending' })));
    setCurrentView('dataset');

    for (const file of acceptedFiles) {
      setUploadProgress(prev => prev.map(p => p.name === file.name ? { ...p, status: 'uploading' } : p));
      const formData = new FormData();
      formData.append('image', file);
      try {
        await axios.post(`${API_BASE}/upload`, formData);
        setUploadProgress(prev => prev.map(p => p.name === file.name ? { ...p, status: 'success' } : p));
      } catch (err) {
        setUploadProgress(prev => prev.map(p => p.name === file.name ? { ...p, status: 'error' } : p));
      }
    }
    await fetchImages();
  };

  const selectPin = async (pin) => {
    setSelectedPin(pin);
    setCurrentView('detail');
    setLoading(true);
    try {
      const fullUrl = `${API_BASE}${pin.url}`;
      const response = await axios.post(`${API_BASE}/search-url`, { url: fullUrl });
      const filtered = response.data.results.filter(r => r.url !== pin.url);
      setRelatedPins(filtered);
    } catch (err) {
      console.error("Error fetching related pins", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = (e, pin) => {
    if (e) e.stopPropagation();
    const isSaved = savedPins.some(p => p.url === pin.url);
    if (isSaved) {
      setSavedPins(prev => prev.filter(p => p.url !== pin.url));
      addNotification('Pin removed from saved', 'info');
    } else {
      setSavedPins(prev => [...prev, pin]);
      addNotification('Pin saved successfully!', 'success');
    }
  };

  const downloadImage = async (url) => {
    try {
      const response = await fetch(`${API_BASE}${url}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = url.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      addNotification('Image download started!', 'success');
    } catch (err) {
      console.error('Download failed:', err);
      addNotification('Failed to download image', 'error');
    }
  };

  const shareImage = async (url) => {
    try {
      const fullUrl = `${window.location.origin}${url}`;
      if (navigator.share) {
        await navigator.share({
          title: 'VisuLens Inspiration',
          text: 'Check out this inspiration on VisuLens!',
          url: fullUrl
        });
      } else {
        await navigator.clipboard.writeText(fullUrl);
        addNotification('Image link copied to clipboard!', 'success');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const hidePin = (pinUrl) => {
    setHiddenPins(prev => [...prev, pinUrl]);
    addNotification('Pin hidden from view', 'info');
  };



  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDatasetDrop, // Changed to onDatasetDrop for the main dropzone in 'dataset' view
    accept: { 'image/*': [] },
    multiple: true // Allow multiple files for dataset upload
  });

  const breakpointColumnsObj = {
    default: 5,
    1400: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Notifications */}
      <div className="fixed top-24 right-4 z-[200] space-y-2">
        <AnimatePresence>
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`px-4 py-3 rounded-2xl shadow-lg border font-bold text-sm min-w-[250px] ${notif.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                notif.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}
            >
              {notif.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


      {/* Pinterest Header */}
      {currentView !== 'landing' && (
        <header className="fixed top-0 left-0 right-0 h-20 bg-white z-[100] flex items-center px-4 gap-2">
          <div
            className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors"
            onClick={() => setCurrentView('explore')}
          >
            <div className="w-8 h-8 bg-[#e60023] rounded-full flex items-center justify-center">
              <span className="text-white font-black text-xl">P</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('explore')}
            className={`nav-link ${currentView === 'explore' ? 'active' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentView('saved')}
            className={`nav-link ${currentView === 'saved' ? 'active' : ''}`}
          >
            Saved
          </button>
          <button
            onClick={() => setCurrentView('dataset')}
            className={`nav-link ${currentView === 'dataset' ? 'active' : ''}`}
          >
            Create
          </button>

          {/* Search Bar */}
          <div className="search-container">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
              <Search size={20} />
            </div>
            <form onSubmit={onUrlSearch}>
              <input
                type="text"
                placeholder="Search by image URL..."
                className="search-bar"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onFocus={() => setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
              />
            </form>

            {/* Visual Search (Camera) Icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
                onClick={() => document.getElementById('visual-search-input').click()}
                title="Search by image"
              >
                <ImageIcon size={20} />
              </button>
              <input
                id="visual-search-input"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onDrop([e.target.files[0]]);
                  }
                }}
              />
            </div>

            {/* Search History Dropdown */}
            <AnimatePresence>
              {showHistory && searchHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 bg-white mt-2 rounded-2xl shadow-2xl border border-gray-100 p-2 z-50"
                >
                  <p className="text-xs font-bold text-gray-500 px-3 py-2">Recent searches</p>
                  {searchHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                      onClick={() => {
                        if (item.startsWith("Image: ")) return;
                        setUrlInput(item);
                        onUrlSearch();
                      }}
                    >
                      <Search size={16} className="text-gray-400" />
                      <span className="font-bold text-gray-800 truncate">{item}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <IconButton
                icon={<Bell size={24} />}
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMessages(false);
                  setShowUserMenu(false);
                }}
              />
              {notifications.length > 0 && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
              )}

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-bold text-lg">Notifications</h3>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notificationHistory.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notificationHistory.map((notif) => (
                          <div key={notif.id} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                            <p className="font-medium text-gray-800">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notif.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <IconButton
                icon={<MessageCircle size={24} />}
                onClick={() => {
                  setShowMessages(!showMessages);
                  setShowNotifications(false);
                  setShowUserMenu(false);
                }}
              />

              <AnimatePresence>
                {showMessages && (
                  <ChatWindow
                    messages={chatMessages}
                    input={chatInput}
                    setInput={setChatInput}
                    onSend={sendChatMessage}
                    onClose={() => setShowMessages(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            <div
              className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer relative"
              onClick={() => {
                if (isLoggedIn) {
                  setCurrentView('profile');
                } else {
                  setCurrentView('signin');
                }
              }}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {isLoggedIn ? <User size={20} /> : <Lock size={16} className="text-gray-500" />}
              </div>
            </div>
            <div className="relative">
              <div
                className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                  setShowMessages(false);
                }}
              >
                <ChevronDown size={20} />
              </div>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 w-48 z-50"
                  >
                    <div
                      className="dropdown-item text-red-600"
                      onClick={() => {
                        setIsLoggedIn(false);
                        setCurrentView('signin');
                        setShowUserMenu(false);
                      }}
                    >
                      Logout
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Padding - Light pink background for auth view */}
      <main className={`${currentView === 'landing' ? '' : 'pt-20 px-4 pb-20'} ${currentView === 'signin' ? 'bg-[var(--light-pink)] min-h-screen' : ''}`}>


        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LandingPage onGetStarted={() => setCurrentView('explore')} images={exploreImages} backendWaking={backendWaking} />
            </motion.div>
          )}

          {currentView === 'signin' && (
            <motion.div key="signin" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="login-view-container">
              <AuthForm
                onSuccess={(user) => {
                  setIsLoggedIn(true);
                  // Assuming user is the email string or an object with email
                  setUserEmail(typeof user === 'string' ? user : user.email);
                  setCurrentView('explore');
                }}
              />
            </motion.div>
          )}

          {(currentView === 'explore' || currentView === 'results' || currentView === 'saved') && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative">
                {loading && (
                  <div className="centered-loader">
                    <Loader2 className="animate-spin text-[#e60023]" size={40} />
                    <span className="shimmer-text text-xl">Fetching images...</span>
                  </div>
                )}
                {currentView === 'saved' && savedPins.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">No saved pins yet</h3>
                    <p className="text-gray-500">Start saving pins to see them here!</p>
                  </div>
                ) : currentView === 'results' && searchResults.length === 0 && !loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                      <ImageIcon size={60} />
                    </div>
                    <h3 className="text-2xl font-black mb-2 uppercase">No images to see</h3>
                    <p className="text-gray-500">Find similar searches.</p>
                  </div>
                ) : (
                  <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="masonry-grid"
                    columnClassName="masonry-grid_column"
                  >
                    {(currentView === 'explore' ? exploreImages : currentView === 'saved' ? savedPins : searchResults)
                      .filter(pin => !hiddenPins.includes(pin.url))
                      .map((pin, idx) => (
                      <PinCard
                        key={idx}
                        pin={pin}
                        onSelect={selectPin}
                        onSave={toggleSave}
                        onHide={hidePin}
                        onDownload={downloadImage}
                        onShare={shareImage}
                        isSaved={savedPins.some(p => p.url === pin.url)}
                        showMatch={currentView === 'results'}
                        addNotification={addNotification}
                      />
                    ))}
                  </Masonry>
                )}
              </div>
            </motion.div>
          )}

          {currentView === 'dataset' && (
            <motion.div key="dataset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto py-12">
              <h2 className="text-3xl font-black mb-8">Create Dataset</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div
                  {...getRootProps()}
                  className={`h-[450px] border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center p-8 transition-colors
                      ${isDragActive ? 'border-[#e60023] bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                >
                  <input {...getInputProps()} />
                  <div className="w-10 h-10 bg-[#e60023] rounded-full flex items-center justify-center text-white mb-4">
                    <Upload size={20} />
                  </div>
                  <p className="font-bold text-center">Drag and drop or click to upload</p>
                  <p className="text-gray-500 text-sm mt-8 text-center">Recommendation: Use high-quality .jpg files less than 20MB</p>
                  <button className="mt-6 bg-[#e60023] text-white px-8 py-3 rounded-full font-bold hover:bg-[#ad001a] transition-colors">
                    Choose files
                  </button>
                </div>

                <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                  <h3 className="font-bold text-xl mb-4">Upload Queue</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {uploadProgress.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="font-bold text-sm truncate max-w-[150px]">{item.name}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${item.status === 'success' ? 'bg-green-100 text-green-700' :
                          item.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                    {uploadProgress.length === 0 && <p className="text-gray-400 text-center py-10">No active uploads</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'detail' && selectedPin && (
            <PinDetail
              pin={selectedPin}
              related={relatedPins}
              onBack={() => setCurrentView('explore')}
              onSave={toggleSave}
              onHide={hidePin}
              onDownload={downloadImage}
              shareImage={shareImage}
              isSaved={savedPins.some(p => p.url === selectedPin.url)}
              loading={loading}
              onSelectRelated={selectPin}
              breakpointColumnsObj={breakpointColumnsObj}
              addNotification={addNotification}
            />
          )}

          {currentView === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Profile
                user={{ email: userEmail || "Guest" }}
                onLogout={() => {
                  setIsLoggedIn(false);
                  setUserEmail('');
                  setCurrentView('landing');
                }}
                addNotification={addNotification}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div >
  );
}

function LandingPage({ onGetStarted, images, backendWaking }) {
  return (
    <div className="landing-container">
      <div className="landing-bg-grid">
        {images.slice(0, 60).map((img, i) => (
          <div key={i} className="rounded-2xl overflow-hidden aspect-[2/3]">
            <img src={`${API_BASE}${img.url}`} className="w-full h-full object-cover" alt="grid" />
          </div>
        ))}
      </div>
      <div className="landing-hero">
        <h1 className="landing-title">Get your next <br /> <span className="text-gradient">inspiration here</span></h1>
        <button onClick={onGetStarted} className="btn-get-started-premium">
          Get Started <ArrowRight className="ml-2" size={24} />
        </button>
        {backendWaking && (
          <div className="mt-4 flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow text-sm text-gray-600 animate-pulse">
            <Loader2 size={16} className="animate-spin text-[#e60023]" />
            <span>AI server warming up… ready in ~30s</span>
          </div>
        )}
      </div>
    </div>
  );
}



function AuthForm({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const response = await axios.post(`${API_BASE}${endpoint}`, { email, password });
      onSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card flex flex-col items-center">
      <div className="w-12 h-12 bg-[#e60023] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md transition-transform hover:scale-110">
        <span className="text-white font-black text-2xl">P</span>
      </div>
      <h2 className="text-3xl font-black mb-8 tracking-tight text-center">Welcome to VisuLens</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
          <p className="text-red-600 text-sm font-bold text-center">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#e60023] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#ad001a] transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50 border border-transparent"
        >
          {loading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up')}
        </button>
      </form>

      <p className="mt-28 text-sm text-black font-semibold text-center">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="ml-2 font-black text-[#e60023] hover:text-[#ad001a] border-b-2 border-transparent hover:border-[#ad001a] transition-all"
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </div>
  );
}


function PinCard({ pin, onSelect, onSave, onHide, onDownload, onShare, isSaved, showMatch, addNotification }) {
  const [showOptions, setShowOptions] = useState(false);

  const handleReport = (e) => {
    e.stopPropagation();
    setShowOptions(false);
    addNotification('Pin reported', 'info');
  };

  return (
    <div
      className="image-card group mb-4"
      onClick={() => onSelect(pin)}
    >
      <img src={`${API_BASE}${pin.url}`} alt="pin" />
      <div className="overlay scale-105 group-hover:scale-100">
        <div className="flex justify-end p-2">
          <button
            className={`btn-save ${isSaved ? 'bg-black' : ''}`}
            onClick={(e) => onSave(e, pin)}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className="flex justify-between items-center p-2">
          {showMatch ? (
            <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-full text-[10px] font-black">
              {Math.round(pin.similarity * 100)}% Match
            </div>
          ) : <div />}

          <div className="flex gap-2 p-2">
            <button
              className="btn-util w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-white"
              onClick={(e) => { e.stopPropagation(); onShare(pin.url); }}
              title="Share"
            >
              <Upload size={16} />
            </button>
            <div className="relative group/opts">
              <button
                className="btn-util w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-white"
                onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
                title="More options"
              >
                <MoreHorizontal size={16} />
              </button>

              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="dropdown-menu"
                  >
                    <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); onDownload(pin.url); setShowOptions(false); }}>Download image</div>
                    <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); onHide(pin.url); setShowOptions(false); }}>Hide Pin</div>
                    <div className="dropdown-item text-red-600" onClick={handleReport}>Report Pin</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

PinCard.propTypes = {
  // Can add basic proptypes or just structure
};

function PinDetail({ pin, related, onBack, onSave, isSaved, loading, onSelectRelated, breakpointColumnsObj, onHide, onDownload, shareImage, addNotification }) {
  const [showOptions, setShowOptions] = useState(false);

  const handleReport = (e) => {
    if (e) e.stopPropagation();
    setShowOptions(false);
    addNotification('Pin reported', 'info');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <button onClick={onBack} className="mb-6 p-3 hover:bg-gray-100 rounded-full">
        <ArrowRight className="rotate-180" size={24} />
      </button>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:grid md:grid-cols-2 gap-0 mb-12">
        <div className="p-4 flex items-center justify-center bg-gray-50">
          <img src={`${API_BASE}${pin.url}`} className="w-full max-h-[600px] object-contain rounded-[24px]" alt="pin detail" />
        </div>
        <div className="p-12 flex flex-col">
          <div className="flex justify-between mb-20">
            <div className="flex gap-4">
              <div className="relative">
                <IconButton
                  icon={<MoreHorizontal size={24} />}
                  onClick={() => setShowOptions(!showOptions)}
                />
                <AnimatePresence>
                  {showOptions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="dropdown-menu !top-14"
                    >
                      <div className="dropdown-item" onClick={() => { onDownload(pin.url); setShowOptions(false); }}>Download image</div>
                      <div className="dropdown-item" onClick={() => { onHide(pin.url); setShowOptions(false); onBack(); }}>Hide Pin</div>
                      <div className="dropdown-item text-red-600" onClick={handleReport}>Report Pin</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <IconButton
                icon={<Share size={24} />}
                onClick={() => shareImage(pin.url)}
              />
              <IconButton
                icon={<Download size={24} />}
                onClick={() => onDownload(pin.url)}
              />
            </div>
            <button
              className={`btn-save px-10 py-4 ${isSaved ? 'bg-black' : ''}`}
              onClick={(e) => onSave(e, pin)}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          <h2 className="text-4xl font-black mb-4">Discover Similar Aesthetics</h2>
          <p className="text-gray-600 text-lg mb-8">This image was processed by VisuLens AI to find visually matching inspirations.</p>

          <div className="mt-auto flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold">V</div>
            <div>
              <p className="font-bold">VisuLens Curator</p>
              <p className="text-gray-500 text-sm">Automated Collection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-20 bg-white/80 backdrop-blur-md z-30 py-4 mb-8">
        <h3 className="text-2xl font-black text-center">More like this</h3>
      </div>
      
      <div className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center pt-20 bg-white/50 backdrop-blur-sm rounded-3xl">
            <Loader2 className="animate-spin text-[#e60023] mb-4" size={48} />
            <span className="shimmer-text text-xl">Fetching images...</span>
          </div>
        )}
        {!loading && related.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <h3 className="text-2xl font-black mb-2 text-gray-400 uppercase">No images to see</h3>
            <p className="text-gray-400">Find similar searches.</p>
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {related.map((rel, idx) => (
              <PinCard
                key={idx}
                pin={rel}
                onSelect={onSelectRelated}
                onSave={onSave}
                onHide={onHide}
                onDownload={onDownload}
                onShare={shareImage}
                isSaved={false}
                showMatch={true}
                addNotification={addNotification}
              />
            ))}
          </Masonry>
        )}
      </div>
    </motion.div>
  );
}

function Profile({ user, onLogout, addNotification }) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'VisuLens Profile',
          text: `Check out ${user.email}'s profile on VisuLens!`,
          url: window.location.href
        });
        addNotification('Profile shared successfully!', 'success');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        addNotification('Profile link copied!', 'success');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-12">
      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-4xl font-bold text-gray-500 overflow-hidden">
        {user.email ? user.email[0].toUpperCase() : <User size={64} />}
      </div>
      <h1 className="text-4xl font-black mb-2">{user.email ? user.email.split('@')[0] : 'User'}</h1>
      <p className="text-gray-500 mb-8">{user.email}</p>

      <div className="flex gap-4">
        <button
          onClick={handleShare}
          className="px-6 py-3 bg-gray-200 rounded-full font-bold hover:bg-gray-300 transition-colors"
        >
          Share
        </button>
        <button
          className="px-6 py-3 bg-gray-200 rounded-full font-bold hover:bg-gray-300 transition-colors"
          onClick={() => addNotification('Edit Profile coming soon!', 'info')}
        >
          Edit Profile
        </button>
        <button
          onClick={onLogout}
          className="px-6 py-3 bg-red-100 text-red-600 rounded-full font-bold hover:bg-red-200 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function ChatWindow({ messages, input, setInput, onSend, onClose }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="chat-window"
    >
      <div className="chat-header">
        <h3 className="font-bold">Messages</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
          <ChevronDown size={20} />
        </button>
      </div>
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.isBot ? 'message-bot' : 'message-user'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <form className="chat-input-area" onSubmit={onSend}>
        <input
          type="text"
          className="chat-input"
          placeholder="New message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="p-2 bg-[#e60023] text-white rounded-full hover:bg-[#ad001a] transition-colors">
          <ArrowRight size={18} />
        </button>
      </form>
    </motion.div>
  );
}

function IconButton({ icon, onClick }) {
  return (
    <div
      className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors text-gray-700"
      onClick={onClick}
    >
      {icon}
    </div>
  );
}

export default App;
