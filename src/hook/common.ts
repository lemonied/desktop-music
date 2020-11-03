import { useEffect, useRef } from 'react';
import { queryParse } from '../helpers/query';
import { useLocation } from 'react-router-dom';

export const usePrevious = <T=any>(value: T): T | undefined => {
  const prev = useRef<T>();

  useEffect(() => {
    prev.current = value;
  });

  return prev.current;
};

export const useQuery = <T=any>(): T => {
  return queryParse(useLocation().search);
};
