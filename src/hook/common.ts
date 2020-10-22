import { useEffect, useRef } from 'react';

export const usePrevious = <T=any>(value: T): T | undefined => {
  const prev = useRef<T>();

  useEffect(() => {
    prev.current = value;
  });

  return prev.current;
};

