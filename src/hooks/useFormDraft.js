import { useEffect } from 'react';

export default function useFormDraft(storageKey, watch, reset, defaultValues) {
  useEffect(() => {
    const draft = sessionStorage.getItem(storageKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        reset({ ...defaultValues, ...parsed });
      } catch (e) {
        console.error('Failed to parse form draft', e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, reset]); // Avoid adding defaultValues to deps if it's not memoized

  useEffect(() => {
    const subscription = watch((value) => {
      sessionStorage.setItem(storageKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, storageKey]);

  const clearDraft = () => {
    sessionStorage.removeItem(storageKey);
  };

  return { clearDraft };
}
