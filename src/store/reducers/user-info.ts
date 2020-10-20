import { fromJS, Map, Record } from 'immutable';
import { useSelector } from 'react-redux';
import { SET_USER_INFO, REMOVE_USER_INFO, USER_INFO } from '../types';

interface UserInfo {
  status: 0 | 1 | -1;
  qq?: string;
  nick?: string;
  avatar?: string;
}
type StateTypes = Record<UserInfo>;

const defaultState = fromJS({
  status: -1
});

interface Action {
  type: symbol;
  value?: UserInfo
}

export default (state = defaultState, action: Action) => {
  switch (action.type) {
    case SET_USER_INFO:
      return state.merge(Map(action.value as any));
    case REMOVE_USER_INFO:
      return defaultState;
    default:
      return state;
  }
};

export const useUserInfo = (): StateTypes => {
  return useSelector((state: any) => state.get(USER_INFO));
};
