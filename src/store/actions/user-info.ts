import { Dispatch } from 'redux';
import { fromJS } from 'immutable';
import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { SET_USER_INFO, USER_INFO_EXTRA } from '../types';
import { get } from '../../helpers/http';

const { login } = (window as any).globalvars;

export const setUserInfo = (value: any) => {
  return {
    type: SET_USER_INFO,
    value: fromJS(value)
  };
};

export const pullUserInfo = (dispatch: Dispatch) => {
  const extra = localStorage.getItem(USER_INFO_EXTRA);
  if (extra) {
    const { loginParams } = JSON.parse(extra);
    get(loginParams.href).subscribe(res => {
      if (res?.code === 0 && res.base?.code === 0 && res.base.data?.code === 0) {
        const maps = res.base.data.map_userinfo;
        if (maps) {
          const info = maps[Object.keys(maps)[0]];
          if (info) {
            dispatch(
              setUserInfo({ status: 1, qq: info.uin, nick: info.nick, avatar: info.headurl })
            );
            return;
          }
        }
      }
      localStorage.removeItem(USER_INFO_EXTRA);
      dispatch(
        setUserInfo({ status: 0 })
      );
    });
  } else {
    dispatch(
      setUserInfo({ status: 0 })
    );
  }
};

export const useRefreshUserInfo = () => {
  const dispatch = useDispatch();
  return useCallback(() => {
    pullUserInfo(dispatch);
  }, [dispatch]);
};

export const useLogin = () => {
  const refreshUserInfo = useRefreshUserInfo();
  return useCallback(() => {
    login().then((res: any) => {
      localStorage.setItem(USER_INFO_EXTRA, JSON.stringify(res));
      refreshUserInfo();
    });
  }, [refreshUserInfo]);
};
export const useLogout = () => {
  const refreshUserInfo = useRefreshUserInfo();
  return useCallback(() => {
    localStorage.removeItem(USER_INFO_EXTRA);
    refreshUserInfo();
  }, [refreshUserInfo]);
};
