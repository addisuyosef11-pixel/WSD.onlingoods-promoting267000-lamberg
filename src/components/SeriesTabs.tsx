import React from 'react';

interface SeriesTabsProps {
  activeSeries: 'P' | 'B' | 'M' | 'VIP';
  onSeriesChange: (series: 'P' | 'B' | 'M' | 'VIP') => void;
}

const SeriesTabs: React.FC<SeriesTabsProps> = ({ activeSeries, onSeriesChange }) => {
  const tabs = [
    { key: 'P', label: 'P Series' },
    { key: 'B', label: 'B Series' },
    { key: 'M', label: 'Microsavings' },
    { key: 'VIP', label: 'VIP Packages' },
  ];

  return (
    <div className="flex rounded-full p-1 mb-6" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onSeriesChange(tab.key as 'P' | 'B' | 'M' | 'VIP')}
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