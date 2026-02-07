import React from 'react';
import { useTranslation } from 'react-i18next';

const FarmerReports = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-200">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reports_title')}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        {t('reports_placeholder')}
      </p>
    </div>
  );
};

export default FarmerReports;
