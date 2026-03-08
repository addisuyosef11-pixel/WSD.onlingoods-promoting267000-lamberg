import React from 'react';

interface SeriesTabsProps {
  activeSeries: 'P' | 'B';
  onSeriesChange: (series: 'P' | 'B') => void;
}

const SeriesTabs: React.FC<SeriesTabsProps> = ({ activeSeries, onSeriesChange }) => {
  return (
    <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6 shadow-inner">
      {/* P Series Tab */}
      <button
        onClick={() => onSeriesChange('P')}
        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ${
          activeSeries === 'P' 
            ? 'text-white shadow-lg' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
        }`}
        style={activeSeries === 'P' ? { background: 'linear-gradient(135deg, #7acc00 0%, #8fd914 35%, #a3e635 60%, #B0FC38 100%)' } : {}}
      >
        <span>P Series</span>
        {activeSeries === 'P' && (
          <span className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse"></span>
        )}
      </button>

      {/* B Series Tab */}
      <button
        onClick={() => onSeriesChange('B')}
        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ${
          activeSeries === 'B' 
            ? 'text-white shadow-lg' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
        }`}
        style={activeSeries === 'B' ? { background: 'linear-gradient(135deg, #7acc00 0%, #8fd914 35%, #a3e635 60%, #B0FC38 100%)' } : {}}
      >
        <span>B Series</span>
        {activeSeries === 'B' && (
          <span className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse"></span>
        )}
      </button>
    </div>
  );
};

export default SeriesTabs;