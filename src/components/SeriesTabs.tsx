import React from 'react';

interface SeriesTabsProps {
<<<<<<< HEAD
  activeSeries: 'P' | 'B' | 'M';
  onSeriesChange: (series: 'P' | 'B' | 'M') => void;
}

const SeriesTabs: React.FC<SeriesTabsProps> = ({ activeSeries, onSeriesChange }) => {
  const tabs = [
    { key: 'P', label: 'P Series' },
    { key: 'B', label: 'B Series' },
    { key: 'M', label: 'Microsavings' },
  ];

  return (
    <div className="flex rounded-full p-1 mb-6" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onSeriesChange(tab.key as 'P' | 'B' | 'M')}
          className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeSeries === tab.key
              ? 'bg-white text-[#2d3a2d] shadow-sm'
              : 'text-white hover:bg-white/20'
          }`}
        >
          {tab.label}
        </button>
      ))}
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    </div>
  );
};

export default SeriesTabs;