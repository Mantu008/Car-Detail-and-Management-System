import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Modal from '../components/ui/Modal';

const ConfirmContext = createContext(null);

/**
 * Promise-based replacement for window.confirm():
 *   const confirm = useConfirm();
 *   if (await confirm({ title: 'Delete?', tone: 'danger' })) { ... }
 */
export const ConfirmProvider = ({ children }) => {
  const [options, setOptions] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOptions(opts);
      }),
    []
  );

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <Modal
          size="sm"
          title={options.title}
          onClose={() => close(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => close(false)}>
                {options.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                className={`btn ${options.tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => close(true)}
                autoFocus
              >
                {options.confirmText || 'Confirm'}
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-600">{options.message}</p>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
};
