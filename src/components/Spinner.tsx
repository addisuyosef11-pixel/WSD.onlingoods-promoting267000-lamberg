import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = { sm: 20, md: 36, lg: 48 };
  const strokeMap = { sm: 3, md: 4, lg: 5 };
  const s = sizeMap[size];
  const stroke = strokeMap[size];
  const radius = (s - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className={`${className}`}
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <circle
        cx={s / 2}
        cy={s / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={stroke}
      />
      <circle
        cx={s / 2}
        cy={s / 2}
        r={radius}
        fill="none"
        stroke="url(#spinner-gradient)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * 0.7}
      />
      <defs>
        <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7acc00" />
          <stop offset="100%" stopColor="#B0FC38" />
        </linearGradient>
      </defs>
    </svg>
  );
};
