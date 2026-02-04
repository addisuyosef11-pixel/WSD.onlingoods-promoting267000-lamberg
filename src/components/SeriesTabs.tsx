import React from 'react';

interface SeriesTabsProps {
  activeSeries: 'P' | 'B';
  onSeriesChange: (series: 'P' | 'B') => void;
}

const SeriesTabs: React.FC<SeriesTabsProps> = ({ activeSeries, onSeriesChange }) => {
  return (
    <div className="flex rounded-full border-2 border-primary overflow-hidden mb-6">
      <button
        onClick={() => onSeriesChange('P')}
        className={`flex-1 py-3 px-6 font-semibold text-base transition-colors ${
          activeSeries === 'P'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-primary'
        }`}
      >
        P Series
      </button>
      <button
        onClick={() => onSeriesChange('B')}
        className={`flex-1 py-3 px-6 font-semibold text-base transition-colors ${
          activeSeries === 'B'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-primary'
        }`}
      >
        B Series
      </button>
    </div>
  );
};

export default SeriesTabs;
