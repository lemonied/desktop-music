import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getImgByMid } from '../../../api';
import { ADD_FAVORITE, DEL_FAVORITE, SET_FAVORITE, SET_FAVORITE_LOADING } from './types';
import { Observable, of, throwError } from 'rxjs';
import { get } from '../../../helpers/http';
import { catchError, concatMap, tap } from 'rxjs/operators';
import { Song } from '../../../components/player/store/reducers';
import { addToCD, delFromCD, getUserQuery } from '../../../api';
import { useLogout } from '../../../store/actions/user-info';

export function setFavorites(value: Song[]) {
  return {
    type: SET_FAVORITE,
    value
  };
}
export function addFavorite(value: Song) {
  return {
    type: ADD_FAVORITE,
    value
  };
}
export function delFavorite(value: Song) {
  return {
    type: DEL_FAVORITE,
    value
  };
}
export function setFavoriteLoading(value: boolean) {
  return {
    type: SET_FAVORITE_LOADING,
    value
  };
}

export const useSetFavorite = () => {
  const dispatch = useDispatch();
  return useCallback((list: Song[]) => {
    dispatch(setFavorites(list));
  }, [dispatch]);
};
export const useSetFavoriteLoading = () => {
  const dispatch = useDispatch();
  return useCallback((loading: boolean) => {
    dispatch(setFavoriteLoading(loading));
  }, [dispatch]);
};

// In order to ensure that the id is consistent with the currently logged in user
const favoriteIds: any = {
  dissid: '',
  qq: ''
};
export const useGetFavorite = () => {
  const setFavorite = useSetFavorite();
  const logout = useLogout();
  return useCallback<() => Observable<any>>(() => {
    const query = getUserQuery();
    if (!query) {
      return throwError(new Error('User not Login'));
    }
    const { qq, g_tk, diss } = query;
    const getList = (disstid: string, g_tk: string): Observable<any> => {
      return get('https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg', {
        type: 1,
        json: 1,
        utf8: 1,
        onlysong: 1,
        nosign: 1,
        new_format: 1,
        song_begin: 0,
        song_num: 9999,
        ctx: 1,
        disstid: disstid,
        _: Date.now(),
        g_tk_new_20200303: g_tk,
        g_tk: g_tk,
        loginUin: qq,
        hostUin: 0,
        format: 'json',
        inCharset: 'utf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq.json',
        needNewCode: 0
      }).pipe(
        tap(res => {
          if (res.code === 0) {
            setFavorite(res.songlist.map((item: any) => {
              return {
                name: item.name,
                singer: item.singer?.map((v: any) => v.name).join(','),
                album: item.album?.name,
                vip: item.pay?.pay_play,
                songmid: item.mid,
                songid: item.id,
                duration: item.interval,
                image: getImgByMid(item.album?.mid),
                url: item.url
              };
            }));
          }
        })
      );
    };
    if (favoriteIds.dissid && favoriteIds.qq === qq) {
      return getList(favoriteIds.dissid, g_tk);
    } else {
      return get(diss.href).pipe(
        concatMap(res => {
          if (res.code === 0) {
            const item = res.data.mymusic.find((v: any) => v.title === '我喜欢');
            if (item) {
              favoriteIds.dissid = item.id;
              favoriteIds.qq = qq;
              return getList(favoriteIds.dissid, g_tk);
            }
            return throwError(new Error('No Favorite CD'));
          } else if (res.code === 1000) {
            logout();
            return throwError(new Error('User token expired'));
          }
          return throwError('Get dissid Error');
        })
      );
    }
  }, [setFavorite, logout]);
};

export const useAddFavorite = () => {
  const dispatch = useDispatch();
  return useCallback((song: Song) => {
    return addToCD(song.songmid, 201).pipe(
      tap(() => {
        dispatch(addFavorite(song));
      }),
      catchError(err => {
        console.error(err);
        return of({});
      })
    );
  }, [dispatch]);
};
export const useDelFavorite = () => {
  const dispatch = useDispatch();
  return useCallback((song: Song) => {
    return delFromCD(song.songid, 201).pipe(
      tap(() => {
        dispatch(delFavorite(song));
      }),
      catchError(err => {
        console.error(err);
        return of({});
      })
    );
  }, [dispatch]);
};
