import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import { Button, Modal } from './ui';
import { vehicleName } from '../utils/format';

export const carUrl = (car) => `${window.location.origin}/cars/${car._id}`;

/**
 * The QR code holds just the vehicle's URL, so any phone camera opens
 * the vehicle page directly (and no personal data is embedded in it).
 */
const CarQRCode = ({ car, onClose }) => {
  const wrapper = useRef(null);
  const url = carUrl(car);
  const fileBase = `${car.brand}-${car.model}-${car.year}`.replace(/\s+/g, '-').toLowerCase();

  const downloadPng = () => {
    const svg = wrapper.current?.querySelector('svg');
    if (!svg) return;
    const size = 720;
    const padding = 48;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size + 72;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);
      ctx.fillStyle = '#0f172a';
      ctx.font = '600 28px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${vehicleName(car)} (${car.year})`, size / 2, size + 20);
      const link = document.createElement('a');
      link.download = `${fileBase}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR code downloaded');
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy the link');
    }
  };

  return (
    <Modal
      title="Vehicle QR code"
      description={`${vehicleName(car)} · ${car.year}`}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" icon="copy" onClick={copyLink}>
            Copy link
          </Button>
          <Button icon="download" onClick={downloadPng}>
            Download PNG
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div ref={wrapper} className="rounded-xl border border-slate-200 bg-white p-5">
          <QRCode value={url} size={208} level="M" />
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Scan with any phone camera to open this vehicle's page. Print it and keep it in the glovebox or on the
          service book.
        </p>
        <p className="mt-2 w-full truncate rounded-md bg-slate-50 px-3 py-2 font-mono text-xs text-slate-500">{url}</p>
      </div>
    </Modal>
  );
};

export default CarQRCode;
