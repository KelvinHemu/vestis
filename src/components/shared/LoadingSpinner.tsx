import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <style>{`
        @keyframes l4 {
          to { width: 25px; aspect-ratio: 1; }
        }
        .custom-loader {
          width: 60px;
          aspect-ratio: 4;
          --c: #000 90%, #0000;
          background: 
            radial-gradient(circle closest-side at left 6px top 50%, var(--c)),
            radial-gradient(circle closest-side, var(--c)),
            radial-gradient(circle closest-side at right 6px top 50%, var(--c));
          background-size: 100% 100%;
          background-repeat: no-repeat;
          animation: l4 1s infinite alternate;
        }
      `}</style>
      <div className="custom-loader"></div>

    </div>
  );
};
