import { fromJS, List, Record } from 'immutable';
import { injectReducer } from '../../../store/core';
import { HOME_STATE, SET_BANNER, SET_RANKS } from './types';
import { useSelector } from 'react-redux';

interface HomeState {
  banners: List<any>;
  ranks: List<any>;
}
type HomeStateTypes = Record<HomeState>;

const defaultState: HomeStateTypes = fromJS({
  banners: [],
  ranks: []
});

const homeState = (state = defaultState, action: any) => {
  switch (action.type) {
    case SET_BANNER:
      return state.set('banners', List(action.value));
    case SET_RANKS:
      return state.set('ranks', List(action.value));
    default:
      return state;
  }
};

export const useBanners = (): List<any> => {
  return useSelector((state: any) => state.getIn([HOME_STATE, 'banners']));
};
export const useRanks = (): List<any> => {
  return useSelector((state: any) => state.getIn([HOME_STATE, 'ranks']));
};

injectReducer(HOME_STATE, homeState);
