import { random_str } from '../../../helpers/random';

export const PLAYER_INFO = random_str('PLAYER_INFO');
export const SET_PLAYER_INFO = Symbol('SET_PLAYER_INFO');
export const SET_PLAYING_LIST = Symbol('SET_PLAYING_LIST');
export const SET_CURRENT_SONG = Symbol('SET_CURRENT_SONG');
export const SET_CURRENT_SONG_LOADING = Symbol('SET_CURRENT_SONG_LOADING');
export const SET_CURRENT_SONG_PLAYING = Symbol('SET_CURRENT_SONG_PLAYING');
export const SET_LYRIC = Symbol('SET_LYRIC');
export const SET_CURRENT_LYRIC = Symbol('SET_CURRENT_LYRIC');
export const SET_CURRENT_LYRIC_NUM = Symbol('SET_CURRENT_LYRIC_NUM');
export const SET_NOW = Symbol('SET_NOW');
export const SET_DURATION = Symbol('SET_DURATION');
export const SET_PLAY_MODE = Symbol('SET_PLAY_MODE');
export const SET_VOLUME = Symbol('SET_VOLUME');
