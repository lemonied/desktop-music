import { USER_INFO_EXTRA } from '../store/types';
import { Observable, of, throwError } from 'rxjs';
import { queryParse } from '../helpers/query';
import { post } from '../helpers/http';
import { concatMap } from 'rxjs/operators';

interface UserQuery {
  qq: string;
  g_tk: string;
  diss: any;
}
export const getImgByMid = (mid?: string | number): string => {
  if (!mid) {
    return 'https://y.gtimg.cn/mediastyle/music_v11/extra/default_300x300.jpg?max_age=31536000';
  }
  return `https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid}.jpg?max_age=2592000`;
};
export const getUserQuery = (): UserQuery | null => {
  const userInfoExtra = localStorage.getItem(USER_INFO_EXTRA);
  if (!userInfoExtra) {
    return null;
  }
  const parsed = JSON.parse(userInfoExtra);
  const query = queryParse(parsed.loginParams.query);
  const g_tk = query.g_tk;
  const qq = query.loginUin;
  const diss = parsed.diss;
  return { g_tk, qq, diss };
};
export const addToCD = (songmid: string, dirid: string | number): Observable<any> => {
  const query = getUserQuery();
  if (!query) {
    return throwError(new Error('Not Login'));
  }
  const { g_tk, qq } = query;
  return post(`https://c.y.qq.com/splcloud/fcgi-bin/fcg_music_add2songdir.fcg?g_tk=${g_tk}&g_tk_new_20200303=${g_tk}`, {
    loginUin: qq,
    hostUin: 0,
    format: 'json',
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq.post',
    needNewCode: 0,
    uin: qq,
    typelist: 13,
    dirid,
    formsender: 4,
    midlist: songmid,
    source: 153,
    r2: 0,
    r3: 1,
    utf8: 1,
    g_tk
  }).pipe(
    concatMap(res => {
      if (res.code === 0) {
        return of(res);
      }
      return throwError(new Error(String(res)));
    })
  );
};
export const delFromCD = (songid: string, dirid: string | number): Observable<any> => {
  const query = getUserQuery();
  if (!query) {
    return throwError(new Error('Not Login'));
  }
  const { g_tk, qq } = query;
  return post(`https://c.y.qq.com/qzone/fcg-bin/fcg_music_delbatchsong.fcg?g_tk=${g_tk}&g_tk_new_20200303=${g_tk}`, {
    loginUin: qq,
    hostUin: 0,
    format: 'json',
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq.post',
    needNewCode: 0,
    uin: qq,
    typelist: 13,
    dirid,
    formsender: 4,
    ids: songid,
    source: 103,
    flag: 2,
    from: 3,
    types: 3,
    utf8: 1,
    g_tk
  }).pipe(
    concatMap(res => {
      if (res.code === 0) {
        return of(res);
      }
      return throwError(new Error(String(res)));
    })
  );
};
