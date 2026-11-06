import { Link } from 'react-router-dom';

export const LogoMark = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="logo-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3767f8" />
        <stop offset="1" stopColor="#1a37d9" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="9" fill="url(#logo-bg)" />
    <path
      d="M8 19.5v-3.2l2-4.6A2 2 0 0 1 11.8 10.5h8.4a2 2 0 0 1 1.8 1.2l2 4.6v3.2a1 1 0 0 1-1 1h-1.2a2 2 0 0 1-3.6 0h-4.4a2 2 0 0 1-3.6 0H9a1 1 0 0 1-1-1Z"
      fill="none"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M10.5 16h11" stroke="#67e8f9" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const Logo = ({ to = '/', light = false }) => (
  <Link to={to} className="flex items-center gap-2.5">
    <LogoMark className="h-8 w-8 drop-shadow-sm" />
    <span className={`font-display text-[16px] font-bold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
      Car Manager
    </span>
  </Link>
);

export default Logo;
