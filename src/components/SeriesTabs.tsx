import React from 'react';

interface SeriesTabsProps {
  activeSeries: 'P' | 'B' | 'C';
  onSeriesChange: (series: 'P' | 'B' | 'C') => void;
}

const SeriesTabs: React.FC<SeriesTabsProps> = ({ activeSeries, onSeriesChange }) => {
  return (
    <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6 shadow-inner">
      {/* P Series Tab */}
      <button
        onClick={() => onSeriesChange('P')}
        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
          activeSeries === 'P' 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
        }`}
      >
        <span className="text-lg">📈</span>
        <span>P Series</span>
        {activeSeries === 'P' && (
          <span className="ml-1 w-2 h-2 bg-white rounded-full animate-pulse"></span>
        )}
      </button>

      {/* B Series Tab */}
      <button
        onClick={() => onSeriesChange('B')}
        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
          activeSeries === 'B' 
            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
        }`}
      >
        <span className="text-lg">💎</span>
        <span>B Series</span>
        {activeSeries === 'B' && (
          <span className="ml-1 w-2 h-2 bg-white rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Crypto Tab */}
      <button
        onClick={() => onSeriesChange('C')}
        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
          activeSeries === 'C' 
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
        }`}
      >
        <span className="text-lg">🪙</span>
        <span>Crypto</span>
        {activeSeries === 'C' && (
          <span className="ml-1 w-2 h-2 bg-white rounded-full animate-pulse"></span>
        )}
      </button>
    </div>
  );
};

export default SeriesTabs;