import { ADD_FAVORITE, DEL_FAVORITE, FAVORITE, FAVORITE_LOADING, SET_FAVORITE, SET_FAVORITE_LOADING } from './types';
import { injectReducer } from '../../../store/core';
import { useSelector } from 'react-redux';
import { Song } from '../../../components/player/store/reducers';

export type FavoritesState = Song[];

const defaultState: FavoritesState = [];

interface Action {
  type: symbol;
  value?: any;
}

const favoritesState = (state = defaultState, action: Action) => {
  let index: number;
  switch (action.type) {
    case SET_FAVORITE:
      return action.value || [];
    case ADD_FAVORITE:
      index = state.findIndex(v => v.songid === action.value?.songid);
      if (index > -1) {
        state.splice(index, 1);
      }
      return [action.value].concat(state);
    case DEL_FAVORITE:
      index = state.findIndex(v => v.songid === action.value?.songid);
      if (index > -1) {
        state.splice(index, 1);
      }
      return state.slice();
    default:
      return state;
  }
};
const favoriteLoadingState = (state = true, action: any) => {
  switch (action.type) {
    case SET_FAVORITE_LOADING:
      return !!action.value;
    default:
      return state;
  }
};

export const useFavorites = (): FavoritesState => {
  return useSelector((state: any) => state.get(FAVORITE));
};
export const useFavoriteLoading = (): boolean => {
  return useSelector((state: any) => state.get(FAVORITE_LOADING));
};

injectReducer(FAVORITE, favoritesState);
injectReducer(FAVORITE_LOADING, favoriteLoadingState);
