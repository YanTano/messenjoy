import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const SmileyMessageLogo: React.FC<LogoProps> = ({ className = "w-6 h-6", size }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Speech bubble outline */}
      <path d="M 21 13.5 C 21 16 19 17.5 16.5 17.5 H 7.5 L 3.5 21 V 6.5 C 3.5 4 5.5 2.5 8 2.5 H 16.5 C 19 2.5 21 4 21 6.5 Z" fill="currentColor" opacity="0.15" />
      <path d="M 21 13.5 C 21 16 19 17.5 16.5 17.5 H 7.5 L 3.5 21 V 6.5 C 3.5 4 5.5 2.5 8 2.5 H 16.5 C 19 2.5 21 4 21 6.5 Z" stroke="currentColor" strokeWidth="2" />
      
      {/* Smiley Eyes */}
      <circle cx="9" cy="8" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="15" cy="8" r="1.25" fill="currentColor" stroke="none" />
      
      {/* Smiley Mouth */}
      <path
        d="M 8.5 11.5 C 9.5 14.2, 14.5 14.2, 15.5 11.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default SmileyMessageLogo;
