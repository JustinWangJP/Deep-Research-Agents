import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/shared/Header';
import AgentDashboard from './components/dashboard/AgentDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('agents');

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = (dark: boolean) => {
    setDarkMode(dark);
    localStorage.setItem('darkMode', String(dark));
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };


  const tabs = [
    { id: 'agents', name: 'Agents', icon: '🤖' },
    { id: 'search', name: 'Search', icon: '🔍' },
    { id: 'memory', name: 'Memory', icon: '🧠' },
    { id: 'citations', name: 'Citations', icon: '📚' },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <Header darkMode={darkMode} setDarkMode={toggleDarkMode} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'agents' && <AgentDashboard />}
            {activeTab === 'search' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Search Interface Coming Soon
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  The search interface is under development. Check back soon!
                </p>
              </div>
            )}
            {activeTab === 'memory' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Memory Explorer Coming Soon
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  The memory explorer is under development. Check back soon!
                </p>
              </div>
            )}
            {activeTab === 'citations' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Citation Manager Coming Soon
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  The citation manager is under development. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
