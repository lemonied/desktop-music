import { List } from 'immutable';
import { Music } from '../../../components/song-list/music';
import { FAVORITE, SET_FAVORITE } from './types';
import { injectReducer } from '../../../store/core';
import { useSelector } from 'react-redux';

export type FavoritesState = List<Music>;

const defaultState: FavoritesState = List([]);

interface Action {
  type: symbol;
  value?: Music[];
}

const favoritesState = (state = defaultState, action: Action) => {
  switch (action.type) {
    case SET_FAVORITE:
      return List(action.value || [])
    default:
      return state;
  }
};

export const useFavorites = () => {
  return useSelector((state: any) => state.get(FAVORITE));
};

injectReducer(FAVORITE, favoritesState);
