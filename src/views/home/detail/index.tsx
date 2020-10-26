import React, { FC, useCallback, useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import './style.scss';
import { get } from '../../../helpers/http';
import { getImgByMid, Music } from '../../../components/song-list/music';
import { SongList } from '../../../components/song-list';
import { finalize } from 'rxjs/operators';
import { Loading } from '../../../components/loading';
import { Structure } from '../../../components/structure';
import { RollbackOutlined } from '@ant-design/icons';

interface Props {}
const HomeDetail: FC<Props> = () => {
  const [list, setList] = useState<Music[]>([]);
  const [info, setInfo] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
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
      finalize(() => setLoading(false))
    ).subscribe(res => {
      if (res.code === 0 && typeof res.total_song_num !== 'undefined') {
        setList(res.songlist.map((item: any) => {
          return {
            name: item.data.songname,
            singer: item.data.singer.map((val: any) => val.name).join(','),
            album: item.data.albumname,
            vip: !!item.data.pay.payplay,
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
    });
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
          <RollbackOutlined className={'back'} onClick={() => history.replace('/')} />
          <h1>{loading ? '加载中...' : info?.name}</h1>
        </div>
      }
    >
      {
        loading ?
          <Loading /> :
          <SongList list={list} className={'home-detail-list'} />
      }
    </Structure>
  );
};

export { HomeDetail };
