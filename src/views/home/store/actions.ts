import { SET_BANNER, SET_RANKS } from './types';
import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { get } from '../../../helpers/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export const setBanner = (value: any[]) => {
  return {
    type: SET_BANNER,
    value
  };
};
export const setRanks = (value: any[]) => {
  return {
    type: SET_RANKS,
    value
  };
};

export const useSetBanner = () => {
  const dispatch = useDispatch();
  return useCallback((value: any[]) => {
    dispatch(
      setBanner(value)
    );
  }, [dispatch]);
};

export const useSetRanks = () => {
  const dispatch = useDispatch();
  return useCallback((value: any[]) => {
    dispatch(
      setRanks(value)
    );
  }, [dispatch]);
};
export const useGetRanks = () => {
  const setRanks = useSetRanks();
  return useCallback(() => {
    return get('https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg', {
      _:	Date.now(),
      uin: 0,
      format: 'jsonp',
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'h5',
      needNewCode: 1
    }).pipe(
      map(res => {
        // eslint-disable-next-line no-eval
        const json = eval(`function MusicJsonCallback(e) { return e; }${res}`);
        if (json.code === 0) {
          const list = json.data.topList;
          setRanks(list);
          return list;
        }
        return json;
      }),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }, [setRanks]);
};
