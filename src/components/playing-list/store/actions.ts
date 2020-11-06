import { SET_CURRENT_TAB } from './types';
import { useDispatch } from 'react-redux';
import { useCallback } from 'react';

export function setCurrentTab(value: 0 | 1) {
  return {
    type: SET_CURRENT_TAB,
    value
  };
}

export const useSetCurrentTab = () => {
  const dispatch = useDispatch();
  return useCallback((value: 0 | 1) => {
    dispatch(setCurrentTab(value));
  }, [dispatch]);
};
