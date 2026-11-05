import { Link } from 'react-router-dom';

export const LogoMark = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#0f172a" />
    <path
      d="M8 19.5v-3.2l2-4.6A2 2 0 0 1 11.8 10.5h8.4a2 2 0 0 1 1.8 1.2l2 4.6v3.2a1 1 0 0 1-1 1h-1.2a2 2 0 0 1-3.6 0h-4.4a2 2 0 0 1-3.6 0H9a1 1 0 0 1-1-1Z"
      fill="none"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M10.5 16h11" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const Logo = ({ to = '/', light = false }) => (
  <Link to={to} className="flex items-center gap-2.5">
    <LogoMark />
    <span className={`text-[15px] font-semibold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
      Car Manager
    </span>
  </Link>
);

export default Logo;
