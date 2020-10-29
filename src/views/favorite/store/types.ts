import { random_str } from '../../../helpers/random';

export const FAVORITE = random_str('FAVORITE');
export const SET_FAVORITE = Symbol('SET_FAVORITE');
export const FAVORITE_LOADING = random_str('FAVORITE_LOADING');
export const SET_FAVORITE_LOADING = Symbol('SET_FAVORITE_LOADING');
