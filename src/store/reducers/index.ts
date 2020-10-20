import { combineReducers } from 'redux-immutable';
import userInfo from './user-info';
import { ReducersMapObject } from 'redux';
import { USER_INFO } from '../types';

export const originalReducers: ReducersMapObject = {
  [USER_INFO]: userInfo
};

export default combineReducers({ ...originalReducers });
