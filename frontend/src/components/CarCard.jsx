import { Link } from 'react-router-dom';
import { Badge, Icon, VehicleImage } from './ui';
import { formatCurrency, formatKm, vehicleName } from '../utils/format';

const CarCard = ({ car, onDelete, onShowQR }) => (
  <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-pop">
    <Link to={`/cars/${car._id}`} className="relative block">
      <VehicleImage src={car.image} alt={vehicleName(car)} className="aspect-[16/10] w-full" />
      <div className="absolute left-3 top-3 flex gap-1.5">
        <Badge className="bg-white/95">{car.type || 'Car'}</Badge>
        {car.status === 'suspicious' && <Badge tone="red">Flagged</Badge>}
      </div>
    </Link>

    <div className="flex flex-1 flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/cars/${car._id}`} className="block truncate font-semibold hover:underline">
            {vehicleName(car)}
          </Link>
          <p className="text-sm text-slate-500">
            {car.year}
            {car.color ? ` · ${car.color}` : ''}
          </p>
        </div>
        <p className="shrink-0 font-semibold tabular-nums">{formatCurrency(car.price)}</p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Odometer</dt>
          <dd className="font-medium tabular-nums">{formatKm(car.mileage)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Services</dt>
          <dd className="font-medium tabular-nums">{car.services?.length || 0}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-2 pt-1">
        <Link to={`/cars/${car._id}`} className="btn btn-secondary btn-sm flex-1">
          View details
        </Link>
        {onShowQR && (
          <button type="button" className="btn btn-ghost btn-icon h-8 w-8" onClick={() => onShowQR(car)} title="QR code" aria-label="Show QR code">
            <Icon name="qr" />
          </button>
        )}
        <Link to={`/cars/${car._id}/edit`} className="btn btn-ghost btn-icon h-8 w-8" title="Edit" aria-label="Edit vehicle">
          <Icon name="edit" />
        </Link>
        {onDelete && (
          <button
            type="button"
            className="btn btn-danger-ghost btn-icon h-8 w-8"
            onClick={() => onDelete(car)}
            title="Delete"
            aria-label="Delete vehicle"
          >
            <Icon name="trash" />
          </button>
        )}
      </div>
    </div>
  </article>
);

export default CarCard;
