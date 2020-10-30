import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SET_CD, SET_CD_LOADING } from './types';
import { Observable, throwError } from 'rxjs';
import { USER_INFO_EXTRA } from '../../../store/types';
import { get } from '../../../helpers/http';
import { tap } from 'rxjs/operators';
import { CDItem } from './reducers';
import defaultCD from '../../../common/images/default-cd.png';

export function setCD(value: CDItem[]) {
  return {
    type: SET_CD,
    value
  };
}
export function setCDLoading(value: boolean) {
  return {
    type: SET_CD_LOADING,
    value
  };
}

export const useSetCD = () => {
  const dispatch = useDispatch();
  return useCallback((list: CDItem[]) => {
    dispatch(setCD(list));
  }, [dispatch]);
};
export const useSetCDLoading = () => {
  const dispatch = useDispatch();
  return useCallback((loading: boolean) => {
    dispatch(setCDLoading(loading));
  }, [dispatch]);
};

// In order to ensure that the id is consistent with the currently logged in user
export const useGetCD = () => {
  const setCD = useSetCD();
  return useCallback<() => Observable<any>>(() => {
    const userInfoExtra = localStorage.getItem(USER_INFO_EXTRA);
    if (userInfoExtra) {
      const parsed = JSON.parse(userInfoExtra);
      return get(parsed.diss.href).pipe(
        tap(res => {
          if (res.code === 0) {
            setCD(res.data.mydiss.list.map((item: any) => {
              return {
                dissid: item.dissid,
                picurl: item.picurl || defaultCD,
                dirid: item.dirid,
                title: item.title,
                subtitle: item.subtitle?.trim()
              };
            }));
          }
        })
      );
    }
    return throwError(new Error('Cant get USER_INFO_EXTRA'));
  }, [setCD]);
};
