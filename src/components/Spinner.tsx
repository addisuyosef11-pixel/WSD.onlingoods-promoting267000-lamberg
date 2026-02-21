import React from "react";

interface SpinnerProps {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className = "" }) => {
  return (
    <div
      className={`bg-[#5f5f5f] rounded-2xl px-8 py-6 flex flex-col items-center justify-center ${className}`}
    >
      {/* Spinner */}
      <div className="loader mb-4" />

      {/* Text */}
      <p className="text-white text-lg font-medium">Loading...</p>
    </div>
  );
};
