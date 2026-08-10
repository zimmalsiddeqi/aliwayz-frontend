// src/hooks/useScrollLock.js
import { useEffect } from 'react';

export default function useScrollLock(lock) {
  useEffect(() => {
    if (lock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lock]);
}