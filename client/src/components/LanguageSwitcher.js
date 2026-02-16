import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center">
            <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                    onClick={() => changeLanguage('en')}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${i18n.language === 'en'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    EN
                </button>
                <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
                <button
                    onClick={() => changeLanguage('ta')}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${i18n.language === 'ta'
                        ? 'bg-green-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    தமிழ்
                </button>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
