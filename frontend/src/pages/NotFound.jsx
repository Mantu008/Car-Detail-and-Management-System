import { Link } from 'react-router-dom';
import { Icon } from '../components/ui';

const NotFound = () => (
  <div className="page flex min-h-[65vh] flex-col items-center justify-center text-center">
    <div className="relative">
      <div className="absolute inset-0 scale-150 rounded-full bg-brand-100/70 blur-2xl" aria-hidden="true" />
      <p className="relative bg-gradient-to-b from-brand-600 to-brand-300 bg-clip-text font-display text-8xl font-extrabold tracking-tight text-transparent sm:text-9xl">
        404
      </p>
    </div>
    <h1 className="mt-4 text-3xl font-bold">Looks like a wrong turn</h1>
    <p className="mt-3 max-w-md text-slate-500">The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on the road.</p>
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <Link to="/" className="btn btn-primary btn-lg">
        <Icon name="home" /> Back to home
      </Link>
      <Link to="/support" className="btn btn-secondary btn-lg">
        Contact support
      </Link>
    </div>
  </div>
);

export default NotFound;
