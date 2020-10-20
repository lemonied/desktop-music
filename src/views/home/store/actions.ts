import { SET_BANNER } from './types';
import { useDispatch } from 'react-redux';
import { useCallback } from 'react';

export const setBanner = (value: any[]) => {
  return {
    type: SET_BANNER,
    value
  };
};

export const useSetBanner = () => {
  const dispatch = useDispatch();
  return useCallback((value: any[]) => {
    dispatch(
      setBanner(value)
    );
  }, [dispatch]);
};
