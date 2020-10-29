import { useSelector } from 'react-redux';
import {
  SET_PLAYER_INFO,
  PLAYER_INFO,
  SET_PLAYING_LIST,
  SET_CURRENT_SONG,
  SET_CURRENT_SONG_LOADING,
  SET_CURRENT_SONG_PLAYING,
  SET_NOW,
  SET_DURATION,
  SET_PLAY_MODE,
  SET_LYRIC,
  SET_CURRENT_LYRIC,
  SET_CURRENT_LYRIC_NUM,
  SET_VOLUME,
  VOLUME_SIZE
} from './types';
import { injectReducer } from '../../../store/core';
import { fromJS, List, Record } from 'immutable';
import { LyricLine } from '../lyric';

interface Action {
  type: symbol;
  value?: any;
}

export type PlayModes = 'loop' | 'sequence' | 'random';

export interface Song {
  name: string; // song name
  singer: string; // singer name
  album: string;
  vip: boolean;
  songmid: string;
  songid: string;
  duration: number; // seconds
  image: string; // image url
  url?: string; // play url
}
export type SongState = Record<Song>;
interface PlayerStatesObj {
  playing: boolean;
  now: number;
  duration: number;
  list: Song[];
  currentSong?: Song;
  loading: boolean;
  playMode: PlayModes;
  lyric: LyricLine[];
  currentLyric: string;
  currentLyricNum: number;
  volume: number;
}
export type PlayerStates = Record<PlayerStatesObj>;

export const defaultPlayerInfo: PlayerStates = fromJS({
  playing: false,
  now: 0,
  duration: 0,
  list: [],
  loading: false,
  playMode: 'sequence',
  lyric: [],
  currentLyric: '',
  currentLyricNum: 0,
  volume: Number(localStorage.getItem(VOLUME_SIZE) || 1)
});

const playerState = (state = defaultPlayerInfo, action: Action) => {
  switch (action.type) {
    case SET_PLAYER_INFO:
      return action.value;
    case SET_PLAYING_LIST:
      return state.set('list', action.value);
    case SET_CURRENT_SONG:
      return state.set('currentSong', action.value);
    case SET_CURRENT_SONG_LOADING:
      return state.set('loading', action.value);
    case SET_CURRENT_SONG_PLAYING:
      return state.set('playing', action.value);
    case SET_NOW:
      return state.set('now', action.value);
    case SET_DURATION:
      return state.set('duration', action.value);
    case SET_PLAY_MODE:
      return state.set('playMode', action.value);
    case SET_LYRIC:
      return state.set('lyric', action.value);
    case SET_CURRENT_LYRIC:
      return state.set('currentLyric', action.value);
    case SET_CURRENT_LYRIC_NUM:
      return state.set('currentLyricNum', action.value);
    case SET_VOLUME:
      return state.set('volume', action.value);
    default:
      return state;
  }
};

export const usePlayerInfo = (): PlayerStates => {
  return useSelector((state: any) => state.get(PLAYER_INFO));
};
export const usePlayingList = (): List<SongState> => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'list']));
};
export const useCurrentSong = (): SongState => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'currentSong']));
};
export const useCurrentSongLoading = (): boolean => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'loading']));
};
export const useCurrentSongPlaying = (): boolean => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'playing']));
};
export const useLyric = (): List<LyricLine> => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'lyric']));
};
export const useCurrentLyric = (): string => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'currentLyric']));
};
export const useCurrentLyricNum = (): number => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'currentLyricNum']));
};
export const useNow = (): number => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'now']));
};
export const useDuration = (): number => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'duration']));
};
export const usePlayMode = (): PlayModes => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'playMode']));
};
export const useVolume = (): number => {
  return useSelector((state: any) => state.getIn([PLAYER_INFO, 'volume']));
};


injectReducer(PLAYER_INFO, playerState);
