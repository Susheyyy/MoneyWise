import { useRef } from 'react';

export function useRetryKey() {
  const pending = useRef(null);
  const keyFor = payload => {
    const fingerprint = JSON.stringify(payload);
    if (pending.current?.fingerprint !== fingerprint) {
      const bytes = window.crypto.getRandomValues(new Uint8Array(16));
      const key = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
      pending.current = { fingerprint, key };
    }
    return pending.current.key;
  };
  const clear = () => { pending.current = null; };
  return [keyFor, clear];
}
