import React from 'react';

export const SheetMusicIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
    <g transform="translate(51, 51) scale(0.8)">
      <path
        d="M176.014,0l-2.823,0.01C89.091,1.164,20.78,63.557,15.904,118.564c-3.125,35.072,4.693,63.941,22.568,83.494
        c16.307,17.803,39.765,26.836,69.727,26.836c31.095,0,61.603-29.77,61.603-60.106c0-30.803-25.076-55.869-55.888-55.869
        c-16.569,0-27.575,7.323-34.858,12.179c-2.853,1.892-5.796,3.854-7.121,3.854c-0.446,0-1.477-1.184-2.458-5.635
        c-3.399-15.335,1.902-33.644,14.212-48.98c10.399-12.978,34.858-34.726,81.876-34.726c65.67,0,101.833,52.894,101.833,148.952
        c0,192.852-165.703,271.845-216.483,291.459c-10.398,4.016-13.778,12.716-12.492,19.553C39.828,507.002,45.947,512,53.686,512
        c2.448,0,5.037-0.496,7.657-1.477l5.807-2.165C262.916,435.82,362.19,326.247,362.19,182.648C362.19,57.164,265.688,0,176.014,0z"
        fill="currentColor"
      />
      <path
        d="M455.486,126.84c22.771,0,41.282-18.522,41.282-41.292c0-22.76-18.512-41.271-41.282-41.271
          c-22.759,0-41.281,18.511-41.281,41.271C414.205,108.318,432.726,126.84,455.486,126.84z"
        fill="currentColor"
      />
      <path
        d="M455.486,211.365c-22.759,0-41.281,18.522-41.281,41.282c0,22.77,18.522,41.281,41.281,41.281
          c22.771,0,41.282-18.511,41.282-41.281C496.768,229.887,478.256,211.365,455.486,211.365z"
        fill="currentColor"
      />
    </g>
  </svg>
);

export const LoopIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
    <path
      d="M6.8762659,15.1237341 C7.93014755,16.8486822 9.83062143,18 12,18 C14.6124377,18 16.8349158,16.3303847 17.6585886,14 L19.747965,14 C18.8598794,17.4504544 15.7276789,20 12,20 C9.28005374,20 6.87714422,18.6426044 5.43172915,16.5682708 L3,19 L3,13 L9,13 L6.8762659,15.1237341 Z M17.1245693,8.87543068 C16.0703077,7.15094618 14.1695981,6 12,6 C9.3868762,6 7.16381436,7.66961525 6.33992521,10 L4.25,10 C5.13831884,6.54954557 8.27134208,4 12,4 C14.7202162,4 17.123416,5.35695218 18.5692874,7.43071264 L21,5 L21,11 L15,11 L17.1245693,8.87543068 Z"
      fill="currentColor"
    />
  </svg>
);

export const Rewind10Icon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
  >
    <polyline points="9.57 15.41 12.17 24.05 20.81 21.44" strokeLinecap="round" />
    <path
      d="M26.93,41.41V23a.09.09,0,0,0-.16-.07s-2.58,3.69-4.17,4.78"
      strokeLinecap="round"
    />
    <rect x="32.19" y="22.52" width="11.41" height="18.89" rx="5.7" />
    <path
      d="M12.14,23.94a21.91,21.91,0,1,1-.91,13.25"
      strokeLinecap="round"
    />
  </svg>
);

export const Forward10Icon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
  >
    <polyline points="54.43 15.41 51.83 24.05 43.19 21.44" strokeLinecap="round" />
    <path
      d="M51.86,23.94a21.91,21.91,0,1,0,.91,13.25"
      strokeLinecap="round"
    />
    <rect x="30.5" y="22.52" width="11.41" height="18.89" rx="5.7" />
    <path
      d="M25.0 41.41 V23 a.09.09 0 0 0 -.16 -.07 s-2.58 3.69 -4.17 4.78"
      strokeLinecap="round"
    />
  </svg>
);

export const PitchPipeIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);

export const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 87.3 78" className={className} aria-hidden="true">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 10.15z" fill="#ea4335" />
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
  </svg>
);

export const TrebleClefIcon: React.FC<{ className?: string }> = ({ className = 'h-3 w-3' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12.75 2c-.65 0-1.25.4-1.5.99l-.02.05c-.32.78-.45 1.63-.38 2.5.07.82.32 1.6.72 2.3.4.67.92 1.25 1.5 1.77-.38 1.48-.9 2.94-1.56 4.34-.6-1.12-1.54-2-2.71-2.51-1.02-.45-2.16-.54-3.23-.27-1.1.28-2.07.96-2.69 1.9-.62.94-.83 2.08-.57 3.19.34 1.42 1.34 2.59 2.66 3.14 1.13.47 2.41.48 3.55.03.65-.26 1.25-.66 1.73-1.18-.32 1.17-.79 2.3-1.4 3.37-.58 1.02-1.34 1.9-2.26 2.58-.51.38-.85.94-.94 1.57-.09.63.09 1.26.5 1.75.4.48.99.77 1.62.81.63.03 1.25-.2 1.73-.62 1.47-1.27 2.57-2.9 3.2-4.73.66-1.92.89-3.95.7-5.96 1.31-.76 2.37-1.89 2.99-3.28.61-1.37.67-2.92.16-4.34-.49-1.35-1.44-2.48-2.67-3.17.26-.88.42-1.79.47-2.7.05-.88-.13-1.78-.52-2.56-.44-.88-1.17-1.56-2.06-1.94-.4-.17-.83-.26-1.26-.26zm.05 1.5c.34 0 .66.15.89.41.22.25.33.6.3.94-.04.75-.19 1.5-.44 2.22-.57-.52-1.04-1.15-1.38-1.85-.31-.64-.46-1.34-.43-2.05.02-.34.16-.67.4-.89.2-.18.45-.28.71-.28zm-3.8 12.02c.86.32 1.57.94 2.01 1.74-.29.41-.66.75-1.1.98-.82.43-1.8.38-2.58-.13-.78-.51-1.24-1.4-1.2-2.33.04-.84.5-1.61 1.22-2.03.49-.28 1.07-.37 1.63-.23zm2.5-3.08c.55-1.16.98-2.37 1.3-3.6.76.5 1.34 1.23 1.64 2.09.3.85.25 1.79-.14 2.6-.39.81-1.09 1.45-1.93 1.81.04-.98-.19-1.96-.64-2.83-.07-.02-.15-.04-.23-.07z"/>
  </svg>
);

export const StartOverIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const DominantIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z" />
  </svg>
);

export const AudioOnlyIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

export const VideoModeIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="15" height="16" rx="2" />
    <polygon points="22 8 17 12 22 16 22 8" />
  </svg>
);

export const CameraIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

export const CoachIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
    <path d="M5 3v4" />
    <path d="M3 5h4" />
  </svg>
);

export const CastIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
    <line x1="2" y1="20" x2="2.01" y2="20" strokeWidth={3} />
  </svg>
);

export const RecordIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4.5" fill="currentColor" />
  </svg>
);


