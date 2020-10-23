import { useSelector } from 'react-redux';
import { SET_PLAYER_INFO, PLAYER_INFO, SET_PLAYING_LIST, SET_CURRENT_SONG } from './types';
import { PlayerStates, defaultPlayerInfo, audioListener, SongState } from '../player';
import { injectReducer } from '../../../store/core';
import { store } from '../../../store';
import { setPlayerInfo } from './actions';
import { List } from 'immutable';

interface Action {
  type: symbol;
  value?: any;
}

const playerState = (state = defaultPlayerInfo, action: Action) => {
  switch (action.type) {
    case SET_PLAYER_INFO:
      return action.value;
    case SET_PLAYING_LIST:
      return state.set('list', action.value);
    case SET_CURRENT_SONG:
      return state.set('currentSong', action.value);
    default:
      return state;
  }
};

audioListener().subscribe(res => {
  store.dispatch(
    setPlayerInfo(res)
  );
});

export const usePlayerInfo = (): PlayerStates => {
  return useSelector((state: any) => state.get(PLAYER_INFO));
};
export const usePlayingList = (): List<SongState> => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'list']));
};
export const useCurrentSong = (): SongState => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'currentSong']));
};


injectReducer(PLAYER_INFO, playerState);
