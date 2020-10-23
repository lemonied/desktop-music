import { random_str } from '../../../helpers/random';

export const PLAYER_INFO = random_str('PLAYER_INFO');
export const SET_PLAYER_INFO = Symbol('SET_PLAYER_INFO');
export const SET_PLAYING_LIST = Symbol('SET_PLAYING_LIST');
export const SET_CURRENT_SONG = Symbol('SET_CURRENT_SONG');
