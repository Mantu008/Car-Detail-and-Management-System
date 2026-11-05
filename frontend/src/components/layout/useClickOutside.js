import { useEffect } from 'react';

/** Call `handler` when a click / Escape happens outside `ref`. */
const useClickOutside = (ref, handler, active = true) => {
  useEffect(() => {
    if (!active) return undefined;
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    const onKey = (e) => e.key === 'Escape' && handler();
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, handler, active]);
};

export default useClickOutside;
