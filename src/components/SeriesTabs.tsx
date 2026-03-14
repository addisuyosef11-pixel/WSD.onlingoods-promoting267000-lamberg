import React from 'react';

interface SeriesTabsProps {
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
    </div>
  );
};

export default SeriesTabs;