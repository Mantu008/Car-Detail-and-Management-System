import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="page flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="text-sm font-semibold text-brand-600">404</p>
    <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
    <p className="mt-2 text-slate-500">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
    <Link to="/" className="btn btn-primary mt-6">
      Back to home
    </Link>
  </div>
);

export default NotFound;
