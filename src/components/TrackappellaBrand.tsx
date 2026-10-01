import React, { useState } from 'react';

interface TrackappellaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  imageSrc?: string;
  textColor?: string;
}

export const TrackappellaLogo: React.FC<TrackappellaLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
  imageSrc = '/tk_tagline.png'
}) => {
  const [imageError, setImageError] = useState(false);

  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-18 sm:h-20'
  };

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      {!imageError ? (
        <img
          src={imageSrc}
          alt="Trackappella Logo"
          onError={() => setImageError(true)}
          className={`w-auto ${heightClasses[size]} object-contain select-none transition-transform group-hover:scale-[1.02]`}
        />
      ) : (
        /* Clean fallback display if the file is being placed */
        <div className="flex items-center gap-1 font-sans select-none tracking-tight">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Tracka<span className="text-[#ff5757]">pp</span>ella
          </span>
        </div>
      )}

      {showSubtitle && (
        <span className="text-[10px] font-sans font-medium text-slate-400 tracking-widest uppercase pl-1 mt-0.5">
          Vocal Rehearsal Platform
        </span>
      )}
    </div>
  );
};
