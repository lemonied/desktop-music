import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Music } from '../../../components/song-list/music';
import { SET_FAVORITE } from './types';

export function setFavorites(value: Music[]) {
  return {
    type: SET_FAVORITE,
    value
  };
}

export const useSetFavorite = () => {
  const dispatch = useDispatch();
  return useCallback((list: Music[]) => {
    dispatch(setFavorites(list));
  }, [dispatch]);
};
