import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'ja', name: '日本語', nativeName: '日本語' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Change language"
        >
          <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[120px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50"
          sideOffset={5}
        >
          {languages.map((language) => (
            <DropdownMenu.Item
              key={language.code}
              className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${
                i18n.language === language.code
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onSelect={() => changeLanguage(language.code)}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{language.nativeName}</span>
              </div>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default LanguageSwitcher;