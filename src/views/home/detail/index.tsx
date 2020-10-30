import React, { FC, useCallback, useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import './style.scss';
import { get } from '../../../helpers/http';
import { getImgByMid } from '../../../api';
import { SongList } from '../../../components/song-list';
import { finalize, tap } from 'rxjs/operators';
import { Loading } from '../../../components/loading';
import { Structure } from '../../../components/structure';
import { CloseOutlined } from '@ant-design/icons';
import { Song } from '../../../components/player/store/reducers';

interface Props {}
const HomeDetail: FC<Props> = () => {
  const [list, setList] = useState<Song[]>([]);
  const [info, setInfo] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const match = useRouteMatch<{id: string}>();
  const history = useHistory();
  const id = match?.params?.id;

  const getList = useCallback(() => {
    if (!id) { return; }
    setLoading(true);
    return get('https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg', {
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      format: 'jsonp',
      topid: id,
      needNewCode: 1,
      uin: 0,
      tpl: 3,
      page: 'detail',
      type: 'top',
      platform: 'h5',
      _: Date.now()
    }).pipe(
      tap(res => {
        if (res.code === 0 && typeof res.total_song_num !== 'undefined') {
          setList(res.songlist.map((item: any) => {
            return {
              name: item.data.songname,
              singer: item.data.singer.map((val: any) => val.name).join(','),
              album: item.data.albumname,
              vip: !!item.data.pay?.payplay,
              songmid: item.data.songmid,
              songid: item.data.songid,
              duration: item.data.interval,
              image: getImgByMid(item.data.albummid)
            };
          }));
          setInfo({
            name: res.topinfo.ListName,
            img: res.topinfo.pic_v12,
            description: res.topinfo.info
          });
        }
      }),
      finalize(() => setLoading(false))
    ).subscribe();
  }, [id]);

  useEffect(() => {
    const subscription = getList();
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [getList]);

  return (
    <Structure
      className={'home-detail'}
      header={
        <div className={'songs-list-header'}>
          <CloseOutlined className={'back'} onClick={() => history.replace('/')} />
          <h1>{loading ? '加载中...' : info?.name}</h1>
        </div>
      }
    >
      {
        loading ?
          <Loading /> :
          <SongList list={list} />
      }
    </Structure>
  );
};

export { HomeDetail };
