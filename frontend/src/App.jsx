import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import AuthModal from './components/AuthModal';
import { 
  getSavedJobs, 
  saveJob, 
  unsaveJob, 
  getSearchHistory, 
  deleteHistoryItem, 
  queryAgent 
} from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortControllerRef = useRef(null);

  // Load user from localstorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    } else {
      // Guest mode initialization
      const localSaved = localStorage.getItem('guest_saved_jobs');
      if (localSaved) setSavedJobs(JSON.parse(localSaved));
      const localHistory = localStorage.getItem('guest_search_history');
      if (localHistory) setSearchHistory(JSON.parse(localHistory));
    }
  }, []);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      // Revert to local storage for guests
      const localSaved = localStorage.getItem('guest_saved_jobs');
      setSavedJobs(localSaved ? JSON.parse(localSaved) : []);
      const localHistory = localStorage.getItem('guest_search_history');
      setSearchHistory(localHistory ? JSON.parse(localHistory) : []);
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [saved, history] = await Promise.all([
        getSavedJobs(),
        getSearchHistory()
      ]);
      setSavedJobs(saved);
      setSearchHistory(history);
    } catch (err) {
      console.error('Error fetching user data from backend:', err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMessages([]);
  };

  const handleSendMessage = async (text) => {
    // Cancel any previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // 1. Append user message
    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // 2. Query the backend agent
      const data = await queryAgent(text, abortControllerRef.current.signal);
      
      // 3. Build assistant response
      let responseText = '';
      if (data.jobs && data.jobs.length > 0) {
        responseText = `I found ${data.jobs.length} jobs matching your criteria! Here are the best matches:`;
      } else {
        responseText = data.message || `No exact job listings found. Try looking for related roles in other tech hub cities.`;
      }

      const botMsg = {
        sender: 'bot',
        text: responseText,
        jobs: data.jobs || [],
        extractedData: {
          role: data.role,
          location: data.location
        }
      };

      setMessages((prev) => [...prev, botMsg]);

      // 4. Update search history list
      if (user) {
        // Fetch new search history recorded by server
        const history = await getSearchHistory();
        setSearchHistory(history);
      } else {
        // Guest mode search history tracking
        const newHistoryItem = {
          id: Date.now().toString(),
          query: text,
          role: data.role || '',
          location: data.location || '',
          searchedAt: new Date().toISOString()
        };
        const updatedHistory = [newHistoryItem, ...searchHistory].slice(0, 15);
        setSearchHistory(updatedHistory);
        localStorage.setItem('guest_search_history', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      if (error.name === 'CanceledError' || error.message === 'canceled') {
        console.log('Request canceled by user.');
        return;
      }
      console.error('Search Agent Error:', error);
      const errorMsg = {
        sender: 'bot',
        text: `Error processing query: ${error.response?.data?.details || error.message || 'Unable to connect to Gemini AI Agent backend.'}`
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async (job) => {
    if (!user) {
      // Guest mode saved jobs toggle
      const isSaved = savedJobs.some(j => j.link === job.link);
      let updatedSaved;
      if (isSaved) {
        updatedSaved = savedJobs.filter(j => j.link !== job.link);
      } else {
        updatedSaved = [{ ...job, id: Date.now().toString(), savedAt: new Date().toISOString() }, ...savedJobs];
      }
      setSavedJobs(updatedSaved);
      localStorage.setItem('guest_saved_jobs', JSON.stringify(updatedSaved));
      return;
    }

    try {
      const savedJobRef = savedJobs.find(j => j.link === job.link);
      if (savedJobRef) {
        // Unsave
        await unsaveJob(savedJobRef._id || savedJobRef.id);
      } else {
        // Save
        await saveJob(job);
      }
      // Refresh saved jobs list
      const savedList = await getSavedJobs();
      setSavedJobs(savedList);
    } catch (err) {
      console.error('Failed to toggle save job:', err.message);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    if (!user) {
      const updatedSaved = savedJobs.filter(j => j._id !== jobId && j.id !== jobId);
      setSavedJobs(updatedSaved);
      localStorage.setItem('guest_saved_jobs', JSON.stringify(updatedSaved));
      return;
    }

    try {
      await unsaveJob(jobId);
      const savedList = await getSavedJobs();
      setSavedJobs(savedList);
    } catch (err) {
      console.error('Failed to unsave job:', err.message);
    }
  };

  const handleDeleteHistory = async (historyId) => {
    if (!user) {
      const updatedHistory = searchHistory.filter(h => h.id !== historyId);
      setSearchHistory(updatedHistory);
      localStorage.setItem('guest_search_history', JSON.stringify(updatedHistory));
      return;
    }

    try {
      await deleteHistoryItem(historyId);
      const historyList = await getSearchHistory();
      setSearchHistory(historyList);
    } catch (err) {
      console.error('Failed to delete history item:', err.message);
    }
  };

  const handleSelectHistory = (query) => {
    handleSendMessage(query);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  return (
    <div className="h-full flex overflow-hidden bg-brand-950">
      {/* Sidebar Panel */}
      <Sidebar 
        user={user}
        savedJobs={savedJobs}
        searchHistory={searchHistory}
        onAuthTrigger={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onSelectHistory={handleSelectHistory}
        onDeleteHistory={handleDeleteHistory}
        onUnsaveJob={handleUnsaveJob}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Chat Panel */}
      <ChatInterface 
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={loading}
        savedJobs={savedJobs}
        onSaveToggle={handleSaveToggle}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
