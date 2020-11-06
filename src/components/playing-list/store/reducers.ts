import { Record, fromJS } from 'immutable';
import { injectReducer } from '../../../store/core';
import { PLAYING_LIST, SET_CURRENT_TAB } from './types';
import { useSelector } from 'react-redux';

interface PlayingPage {
  currentTab: 0 | 1;
}

type PlayingPageState = Record<PlayingPage>;

const defaultState: PlayingPageState = fromJS({
  currentTab: 0
});

const playing = (state = defaultState, action: any) => {
  switch (action.type) {
    case SET_CURRENT_TAB:
      return state.set('currentTab', action.value);
    default:
      return state;
  }
};

export const useCurrentTab = () => {
  return useSelector((state: any) => state.getIn([PLAYING_LIST, 'currentTab']));
};

injectReducer(PLAYING_LIST, playing);
