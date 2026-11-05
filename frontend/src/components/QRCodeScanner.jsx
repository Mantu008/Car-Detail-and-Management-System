import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Field, Icon, Modal } from './ui';

const OBJECT_ID = /^[a-f0-9]{24}$/i;

/** Accept a vehicle URL, an older JSON QR payload, or a bare vehicle ID. */
export const parseVehicleId = (raw) => {
  const text = String(raw || '').trim();
  if (!text) return null;
  if (OBJECT_ID.test(text)) return text;
  const fromUrl = text.match(/\/cars\/([a-f0-9]{24})/i);
  if (fromUrl) return fromUrl[1];
  try {
    const json = JSON.parse(text);
    if (OBJECT_ID.test(json.carId || '')) return json.carId;
  } catch {
    /* not JSON */
  }
  return null;
};

const supportsDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

const QRCodeScanner = ({ onClose }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [manual, setManual] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const openVehicle = useCallback(
    (raw) => {
      const id = parseVehicleId(raw);
      if (!id) {
        setError("That doesn't look like a vehicle QR code or link.");
        return false;
      }
      stopCamera();
      onClose();
      navigate(`/cars/${id}`);
      return true;
    },
    [navigate, onClose, stopCamera]
  );

  const startCamera = async () => {
    setError('');
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setScanning(true);
    } catch {
      setError('Camera access was blocked. Allow camera permission or paste the link instead.');
    }
  };

  // Once the <video> is mounted, attach the stream and poll for QR codes.
  useEffect(() => {
    const video = videoRef.current;
    if (!scanning || !video || !streamRef.current) return undefined;
    let timer;
    let cancelled = false;
    video.srcObject = streamRef.current;
    video.play().catch(() => {});
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    const tick = async () => {
      if (cancelled || !streamRef.current) return;
      try {
        const codes = await detector.detect(video);
        if (codes.length && openVehicle(codes[0].rawValue)) return;
      } catch {
        /* frame not ready yet */
      }
      timer = setTimeout(tick, 250);
    };
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [scanning, openVehicle]);

  const scanImage = async (file) => {
    if (!file) return;
    setError('');
    try {
      const bitmap = await createImageBitmap(file);
      const codes = await new window.BarcodeDetector({ formats: ['qr_code'] }).detect(bitmap);
      if (!codes.length) setError('No QR code found in that image.');
      else openVehicle(codes[0].rawValue);
    } catch {
      setError('Could not read that image.');
    }
  };

  return (
    <Modal title="Scan vehicle QR code" description="Open a vehicle's page from its QR code or link." onClose={onClose} size="md">
      <div className="space-y-5">
        {error && <Alert tone="red">{error}</Alert>}

        {supportsDetector ? (
          scanning ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-lg bg-slate-900">
                <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
                <div className="pointer-events-none absolute inset-10 rounded-xl border-2 border-white/70" />
              </div>
              <Button variant="secondary" className="w-full" onClick={stopCamera}>
                Stop camera
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" className="h-20 flex-col gap-1.5" onClick={startCamera}>
                <Icon name="camera" className="h-5 w-5" /> Use camera
              </Button>
              <label className="btn btn-secondary h-20 cursor-pointer flex-col gap-1.5">
                <Icon name="image" className="h-5 w-5" /> Upload image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => scanImage(e.target.files[0])} />
              </label>
            </div>
          )
        ) : (
          <Alert tone="blue">
            Your browser can't scan QR codes directly. Use your phone's camera app — it will open the vehicle page — or paste the
            link below.
          </Alert>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            openVehicle(manual);
          }}
        >
          <Field label="Vehicle link or ID" htmlFor="qr-manual">
            <div className="flex gap-2">
              <input
                id="qr-manual"
                className="input"
                placeholder="https://…/cars/66f1… or vehicle ID"
                value={manual}
                onChange={(e) => {
                  setManual(e.target.value);
                  setError('');
                }}
              />
              <Button type="submit" disabled={!manual.trim()}>
                Open
              </Button>
            </div>
          </Field>
        </form>
      </div>
    </Modal>
  );
};

export default QRCodeScanner;
