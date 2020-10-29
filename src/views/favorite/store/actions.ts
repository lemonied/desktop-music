import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getImgByMid } from '../../../components/song-list/music';
import { SET_FAVORITE, SET_FAVORITE_LOADING } from './types';
import { Observable, throwError } from 'rxjs';
import { USER_INFO_EXTRA } from '../../../store/types';
import { get, post } from '../../../helpers/http';
import { concatMap, tap } from 'rxjs/operators';
import { queryParse } from '../../../helpers/query';
import { useUserInfo } from '../../../store/reducers/user-info';
import { Song } from '../../../components/player/store/reducers';

export function setFavorites(value: Song[]) {
  return {
    type: SET_FAVORITE,
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
  const userInfo = useUserInfo();
  const dispatch = useDispatch();
  return useCallback<() => Observable<any>>(() => {
    const userInfoExtra = localStorage.getItem(USER_INFO_EXTRA);
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
        loginUin: userInfo.get('qq'),
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
            dispatch(setFavorites(res.songlist.map((item: any) => {
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
            })));
          }
        })
      );
    };
    if (userInfoExtra && userInfo.get('status') === 1) {
      const parsed = JSON.parse(userInfoExtra);
      const g_tk = queryParse(parsed.loginParams.query).g_tk;
      if (favoriteIds.dissid && favoriteIds.qq === userInfo.get('qq')) {
        return getList(favoriteIds.dissid, g_tk);
      } else {
        return get(parsed.diss.href).pipe(
          concatMap(res => {
            if (res.code === 0) {
              const item = res.data.mymusic.find((v: any) => v.title === '我喜欢');
              if (item) {
                favoriteIds.dissid = item.id;
                favoriteIds.qq = userInfo.get('qq');
                return getList(favoriteIds.dissid, g_tk);
              }
              return throwError(new Error('No Favorite CD'));
            }
            return throwError('Get dissid Error');
          })
        );
      }
    }
    return throwError(new Error('User Not Login'));
  }, [dispatch, userInfo]);
};

export const useAddFavorite = () => {
  const userInfo = useUserInfo();
  return useCallback((song: Song) => {
    const userInfoExtra = localStorage.getItem(USER_INFO_EXTRA);
    if (!userInfoExtra) {
      return throwError(new Error('Not Login'));
    }
    const parsed = JSON.parse(userInfoExtra);
    const g_tk = queryParse(parsed.loginParams.query).g_tk;
    return post(`/splcloud/fcgi-bin/fcg_music_add2songdir.fcg?g_tk=${g_tk}&g_tk_new_20200303=${g_tk}`, JSON.stringify({
      loginUin: userInfo.get('qq'),
      hostUin: 0,
      format: 'json',
      inCharset: 'utf8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'yqq.post',
      needNewCode: 0,
      uin: userInfo.get('qq'),
      typelist: 13,
      dirid: 201,
      formsender: 4,
      midlist: song.songmid,
      source: 153,
      r2: 0,
      r3: 1,
      utf8: 1,
      g_tk
    }), {
      'Content-Type': 'application/json'
    });
  }, [userInfo]);
};
