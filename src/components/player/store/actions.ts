import { PlayerStates, SongState, Song } from '../player';
import { SET_CURRENT_SONG, SET_PLAYER_INFO, SET_PLAYING_LIST } from './types';
import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { fromJS, List } from 'immutable';

export const setPlayerInfo = (value: PlayerStates) => {
  return {
    type: SET_PLAYER_INFO,
    value
  };
};
export const setPlayingList = (value: List<SongState>) => {
  return {
    type: SET_PLAYING_LIST,
    value
  };
};
export const setCurrentSong = (value: SongState) => {
  return {
    type: SET_CURRENT_SONG,
    value
  };
};

export const useSetPlayingList = () => {
  const dispatch = useDispatch();
  return useCallback((songs: Song[]) => {
    dispatch(
      setPlayingList(fromJS(songs))
    );
  }, [dispatch]);
};
export const useSetCurrentSong = () => {
  const dispatch = useDispatch();
  return useCallback((song: Song) => {
    dispatch(
      setCurrentSong(fromJS(song))
    );
  }, [dispatch]);
};
