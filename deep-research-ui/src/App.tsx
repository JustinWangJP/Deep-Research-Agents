import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['common']);
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
    { id: 'agents', name: t('navigation.agents'), icon: '🤖', description: t('navigation.agentsDescription') },
    { id: 'search', name: t('navigation.search'), icon: '🔍', description: t('navigation.searchDescription') },
    { id: 'memory', name: t('navigation.memory'), icon: '🧠', description: t('navigation.memoryDescription') },
    { id: 'citations', name: t('navigation.citations'), icon: '📚', description: t('navigation.citationsDescription') },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
        <Header darkMode={darkMode} setDarkMode={toggleDarkMode} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Tab Navigation */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
              <nav className="flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center py-4 px-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="text-lg mb-1">{tab.icon}</span>
                    <span className="font-semibold">{tab.name}</span>
                    <span className="text-xs opacity-75 mt-1">{tab.description}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content with Enhanced Styling */}
          <div className="space-y-6">
            {activeTab === 'agents' && <AgentDashboard />}
            {activeTab === 'search' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('common.comingSoon')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t('common.searchInterfaceDescription')}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('common.searchFeatures')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'memory' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('common.comingSoon')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t('common.memoryInterfaceDescription')}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('common.memoryFeatures')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'citations' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('common.comingSoon')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t('common.citationsInterfaceDescription')}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('common.citationsFeatures')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
