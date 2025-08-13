import React from 'react';
import { Brain, Sun, Moon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Deep Research Agents</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "text-gray-600 dark:text-gray-400"
              )}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;