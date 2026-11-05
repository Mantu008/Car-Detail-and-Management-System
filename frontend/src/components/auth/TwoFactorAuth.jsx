import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';
import { Alert, Button, Field, Modal, PageLoader } from '../ui';
import { errorMessage } from '../../utils/format';

/** Three-step 2FA enrolment: scan QR -> confirm code -> save backup codes. */
const TwoFactorSetup = ({ onClose, onEnabled }) => {
  const [step, setStep] = useState('scan');
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const started = useRef(false);

  useEffect(() => {
    // Each setup call creates a new secret server-side, so only call it once.
    if (started.current) return;
    started.current = true;
    api
      .post('/api/auth/2fa/setup')
      .then((res) => setSetup(res.data.data))
      .catch((err) => setError(errorMessage(err, 'Could not start setup')));
  }, []);

  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/api/auth/2fa/verify', { code });
      setBackupCodes(res.data.data.backupCodes);
      setStep('codes');
      onEnabled();
    } catch (err) {
      setError(errorMessage(err, 'That code is not valid'));
    } finally {
      setBusy(false);
    }
  };

  const codesText = `Car Manager — two-factor backup codes\nGenerated ${new Date().toLocaleString('en-IN')}\nEach code can be used once.\n\n${backupCodes.join('\n')}\n`;

  const copy = () =>
    navigator.clipboard.writeText(backupCodes.join('\n')).then(
      () => toast.success('Backup codes copied'),
      () => toast.error('Could not copy')
    );

  const download = () => {
    const url = URL.createObjectURL(new Blob([codesText], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'car-manager-backup-codes.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const footers = {
    scan: (
      <>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => setStep('verify')} disabled={!setup}>
          Next
        </Button>
      </>
    ),
    verify: (
      <>
        <Button variant="secondary" onClick={() => setStep('scan')}>
          Back
        </Button>
        <Button type="submit" form="verify-2fa" loading={busy} disabled={code.length !== 6}>
          Verify &amp; enable
        </Button>
      </>
    ),
    codes: <Button onClick={onClose}>I&apos;ve saved my codes</Button>,
  };

  return (
    <Modal title="Set up two-factor authentication" onClose={step === 'codes' ? undefined : onClose} size="md" footer={footers[step]}>
      {error && (
        <Alert tone="red" className="mb-4">
          {error}
        </Alert>
      )}

      {step === 'scan' &&
        (setup ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">1.</span> Scan this QR code with your authenticator app.
            </p>
            <div className="flex justify-center">
              <img src={setup.qrCode} alt="Two-factor QR code" className="h-52 w-52 rounded-lg border border-slate-200 p-2" />
            </div>
            <details className="rounded-lg border border-slate-200 px-4 py-3 text-sm">
              <summary className="cursor-pointer font-medium text-slate-700">Can&apos;t scan? Enter the key manually</summary>
              <p className="mt-2 break-all font-mono text-xs tracking-wider text-slate-600">{setup.secret}</p>
            </details>
          </div>
        ) : (
          !error && <PageLoader className="py-10" label="Generating key…" />
        ))}

      {step === 'verify' && (
        <form id="verify-2fa" onSubmit={verify} className="space-y-4">
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">2.</span> Enter the 6-digit code shown in your app.
          </p>
          <Field label="Verification code" htmlFor="totp">
            <input
              id="totp"
              className="input text-center font-mono text-lg tracking-[0.4em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </Field>
        </form>
      )}

      {step === 'codes' && (
        <div className="space-y-4">
          <Alert tone="green" title="Two-factor authentication is on" />
          <p className="text-sm text-slate-600">
            Save these backup codes somewhere safe. Each one signs you in once if you lose access to your phone. They
            won&apos;t be shown again.
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-4 font-mono text-sm">
            {backupCodes.map((c) => (
              <span key={c} className="text-center tracking-wider">
                {c}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon="copy" onClick={copy}>
              Copy
            </Button>
            <Button variant="secondary" size="sm" icon="download" onClick={download}>
              Download .txt
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TwoFactorSetup;
