import React from 'react';

export interface PinColor {
  name: string;
  head: string;
  highlight: string;
  shadow: string;
  rim: string;
}

export const OFFICE_PIN_COLORS: PinColor[] = [
  { name: 'crimson', head: '#E53935', highlight: '#FF8A80', shadow: '#B71C1C', rim: '#D32F2F' },
  { name: 'royalblue', head: '#1E88E5', highlight: '#90CAF9', shadow: '#0D47A1', rim: '#1976D2' },
  { name: 'sunyellow', head: '#FBC02D', highlight: '#FFF59D', shadow: '#F57F17', rim: '#F9A825' },
  { name: 'emerald', head: '#43A047', highlight: '#A5D6A7', shadow: '#1B5E20', rim: '#388E3C' },
  { name: 'brightorange', head: '#FB8C00', highlight: '#FFE0B2', shadow: '#E65100', rim: '#F57C00' },
  { name: 'purple', head: '#8E24AA', highlight: '#CE93D8', shadow: '#4A148C', rim: '#7B1FA2' },
  { name: 'turquoise', head: '#00ACC1', highlight: '#80DEEA', shadow: '#006064', rim: '#0097A7' },
  { name: 'berrypink', head: '#E91E63', highlight: '#F48FB1', shadow: '#880E4F', rim: '#C2185B' },
  { name: 'applegreen', head: '#7CB342', highlight: '#DCE775', shadow: '#33691E', rim: '#689F38' },
];

interface OfficePushPinProps {
  color: PinColor;
  className?: string;
  isRemoving?: boolean;
  isReturning?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export const OfficePushPin: React.FC<OfficePushPinProps> = ({
  color,
  className = '',
  isRemoving = false,
  isReturning = false,
  size = 'md',
  style,
}) => {
  const width = size === 'sm' ? 14 : size === 'lg' ? 22 : 17;
  const height = size === 'sm' ? 18 : size === 'lg' ? 28 : 22;

  return (
    <div
      style={style}
      className={`relative inline-block pointer-events-none transition-all ${
        isRemoving
          ? 'animate-pin-pull-out'
          : isReturning
          ? 'animate-pin-insert'
          : ''
      } ${className}`}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 18 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
      >
        {/* Soft needle shadow */}
        <ellipse cx="9" cy="20" rx="3.5" ry="1.5" fill="rgba(0,0,0,0.38)" />
        {/* Silver Metallic Needle */}
        <polygon points="9,21.5 7.8,13.5 10.2,13.5" fill="#CFD8DC" />
        <line x1="9" y1="13.5" x2="9" y2="21.5" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.85" />
        {/* Disc base */}
        <ellipse cx="9" cy="13.5" rx="4.5" ry="1.8" fill={color.shadow} />
        <ellipse cx="9" cy="13" rx="4.2" ry="1.6" fill={color.rim} />
        {/* Push Pin Bulb Head */}
        <circle cx="9" cy="7.5" r="5.8" fill={color.head} />
        {/* 3D Radial Highlight */}
        <circle cx="9" cy="7.5" r="5.8" fill={`url(#pin-grad-${color.name})`} />
        {/* Specular Glint */}
        <ellipse cx="7.2" cy="5.8" rx="2.2" ry="1.5" fill={color.highlight} opacity="0.88" />
        <circle cx="6.5" cy="5.2" r="0.85" fill="#FFFFFF" opacity="0.95" />

        <defs>
          <radialGradient id={`pin-grad-${color.name}`} cx="35%" cy="32%" r="68%">
            <stop offset="0%" stopColor={color.highlight} stopOpacity="0.65" />
            <stop offset="65%" stopColor={color.head} stopOpacity="0.85" />
            <stop offset="100%" stopColor={color.shadow} stopOpacity="1" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};
