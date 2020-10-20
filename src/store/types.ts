import { random_str } from '../helpers/random';

export const USER_INFO = random_str('USER_INFO');
export const SET_USER_INFO = Symbol('SET_USER_INFO');
export const REMOVE_USER_INFO = Symbol('REMOVE_USER_INFO');
export const USER_INFO_EXTRA = 'USER_INFO_EXTRA';