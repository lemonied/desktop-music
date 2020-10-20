import { fromJS, List, Record } from 'immutable';
import { injectReducer } from '../../../store/core';
import { HOME_STATE, SET_BANNER } from './types';
import { useSelector } from 'react-redux';

interface HomeState {
  banners: List<any>;
}
type HomeStateTypes = Record<HomeState>;

const defaultState: HomeStateTypes = fromJS({
  banners: []
});

const homeState = (state = defaultState, action: any) => {
  switch (action.type) {
    case SET_BANNER:
      return state.set('banners', List(action.value));
    default:
      return state;
  }
};

export const useBanners = (): List<any> => {
  return useSelector((state: any) => state.getIn(HOME_STATE, 'banners'));
};

injectReducer(HOME_STATE, homeState);
