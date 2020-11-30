import { Boom, Jinx, Spells } from '../../store/core';
import { Song } from '../../components/player/store/reducers';
import { get } from '../../helpers/http';
import { concatMap, map } from 'rxjs/operators';
import { addToCD, delFromCD, getImgByMid, getUserQuery } from '../../api';
import { of, throwError } from 'rxjs';

export type FavoritesState = Song[];

const defaultState: FavoritesState = [];

@Jinx('favorites', defaultState)
class Favorites extends Spells<FavoritesState> {
  favoriteIds = { dissid: '', qq: '' };
  getList(disstid: string, g_tk: string, qq: string) {
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
      map(res => {
        if (res.code === 0) {
          return res.songlist.map((item: any) => {
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
          });
        }
        return of([]);
      })
    );
  }
  @Boom
  getFavorites() {
    const query = getUserQuery();
    if (!query) {
      return throwError(new Error('User not Login'));
    }
    const { qq, g_tk, diss } = query;
    if (this.favoriteIds.dissid && this.favoriteIds.qq === qq) {
      return this.getList(this.favoriteIds.dissid, g_tk, qq);
    } else {
      return get(diss.href).pipe(
        concatMap(res => {
          if (res.code === 0) {
            const item = res.data.mymusic.find((v: any) => v.title === '我喜欢');
            if (item) {
              this.favoriteIds.dissid = item.id;
              this.favoriteIds.qq = qq;
              return this.getList(this.favoriteIds.dissid, g_tk, qq);
            }
            return throwError(new Error('No Favorite CD'));
          } else if (res.code === 1000) {
            // logout();
            return throwError(new Error('User token expired'));
          }
          return throwError('Get dissid Error');
        })
      );
    }
  }
  @Boom
  addFavorite(song: Song) {
    return addToCD(song.songmid, 201).pipe(
      map(() => {
        const state = this.getState();
        const index = state.findIndex(v => v.songid === song.songid);
        if (index > -1) {
          state.splice(index, 1);
        }
        return [song].concat(state);
      })
    );
  }
  @Boom
  delFavorite(song: Song) {
    return delFromCD(song.songid, 201).pipe(
      map(() => {
        const state = this.getState();
        const copy = state.slice();
        const index = copy.findIndex(v => v.songid === song.songid);
        if (index > -1) {
          copy.splice(index, 1);
        }
        return copy;
      })
    );
  }
}

export const favorites = new Favorites();

@Jinx('favoriteLoading', false)
class FavoriteLoading extends Spells<boolean> {}
export const favoriteLoading = new FavoriteLoading();
