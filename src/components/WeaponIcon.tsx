import React from 'react';
import { WeaponId } from '../types/game';

interface WeaponIconProps {
  id: WeaponId;
  className?: string;
  size?: number;
}

export const WeaponIcon: React.FC<WeaponIconProps> = ({ id, className = '', size = 24 }) => {
  switch (id) {
    case 'drag':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      );
    case 'slap':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M11 4v5" />
          <path d="M8 6v4" />
          <path d="M14 5v5" />
          <path d="M17 7v4" />
          <path d="M5 13a4 4 0 0 0 4 4h7a4 4 0 0 0 4-4V9a2 2 0 0 0-2-2h-1a2 2 0 0 0-2-2h-1a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v6" />
          <path d="m3 19 3-3" />
        </svg>
      );
    case 'mallet':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="4" width="8" height="12" rx="2" transform="rotate(-45 6 10)" fill="currentColor" fillOpacity="0.2" />
          <path d="m14 14 7 7" strokeWidth="3" />
          <path d="M18 18 8 8" />
        </svg>
      );
    case 'boxing_glove':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 14c0 4 3 7 7 7s7-3 7-7c0-2-1-5-3-7-1.5-1.5-4-2-6-1-2.5 1.2-5 3-5 8Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M11 21v-4" />
          <path d="M4 12c-1.5 0-2 1-2 2s1 2 2 2" />
        </svg>
      );
    case 'tomato':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="13" r="8" fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" />
          <path d="M12 5V2" stroke="#22c55e" strokeWidth="2.5" />
          <path d="m9 5 3-2 3 2-1 2h-4z" fill="#22c55e" />
        </svg>
      );
    case 'pie':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 13h18l-2 7H5z" fill="currentColor" fillOpacity="0.15" />
          <path d="M3 13c1-2 3-3 5-3s4 2 5 1 2-3 4-3 3 2 4 5" strokeWidth="2.5" />
          <circle cx="12" cy="6" r="2" fill="#ef4444" stroke="#dc2626" />
        </svg>
      );
    case 'dynamite':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="6" y="9" width="12" height="12" rx="2" fill="#dc2626" fillOpacity="0.3" stroke="#dc2626" />
          <path d="M12 9V5c1-1 3-1 4-2" stroke="#f59e0b" strokeWidth="2" />
          <path d="m15 2 2 1" stroke="#ef4444" strokeWidth="2" />
          <path d="M6 13h12M6 17h12" stroke="#dc2626" strokeDasharray="2 2" />
        </svg>
      );
    case 'rocket':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="#f59e0b" fillOpacity="0.2" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      );
    case 'anvil':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 6h18v4l-4 3v4h3v3H4v-3h3v-4L3 10V6z" fill="currentColor" fillOpacity="0.2" />
          <path d="M3 6h4" />
        </svg>
      );
    case 'laser':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 12h18" stroke="#38bdf8" strokeWidth="3" />
          <path d="m17 8 4 4-4 4" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="5" cy="12" r="3" fill="#38bdf8" />
        </svg>
      );
    case 'tesla':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#eab308" fillOpacity="0.3" stroke="#eab308" />
        </svg>
      );
    case 'rubber_chicken':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <ellipse cx="12" cy="14" rx="5" ry="7" fill="#facc15" fillOpacity="0.3" stroke="#facc15" />
          <circle cx="12" cy="6" r="3" stroke="#facc15" />
          <path d="m12 6 2 1-2 1" fill="#ef4444" stroke="#ef4444" />
          <path d="M10 21v2M14 21v2" stroke="#ea580c" />
        </svg>
      );
    case 'tornado':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M21 4H3" />
          <path d="M18 8H6" />
          <path d="M19 12H9" />
          <path d="M16 16h-6" />
          <path d="M11 20H9" />
        </svg>
      );
    case 'sponge':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="4" y="6" width="16" height="12" rx="4" fill="#38bdf8" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="9" cy="11" r="1" fill="#38bdf8" />
          <circle cx="15" cy="10" r="1.5" fill="#38bdf8" />
          <circle cx="12" cy="14" r="1" fill="#38bdf8" />
        </svg>
      );
    default:
      return null;
  }
};
