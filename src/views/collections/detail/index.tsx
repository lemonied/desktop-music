import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Structure } from '../../../components/structure';
import './style.scss';
import { get } from '../../../helpers/http';
import { useRouteMatch, Link } from 'react-router-dom';
import { queryParse } from '../../../helpers/query';
import { Observable, throwError } from 'rxjs';
import { userInfo, USER_INFO_EXTRA } from '../../../store/user-info';
import { finalize, map } from 'rxjs/operators';
import { getImgByMid } from '../../../api';
import { SongList } from '../../../components/song-list';
import { Loading } from '../../../components/loading';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Song } from '../../../components/player/store/reducers';
import { useQuery } from '../../../hook/common';

const PAGE_NUM = 50;

const CollectionDetail: FC = () => {
  const match = useRouteMatch<{id: string}>();
  const user = userInfo.use();
  const queryRef = useRef({
    song_begin: 0,
    song_num: PAGE_NUM,
    song_total: 0
  });
  const [list, setList] = useState<Song[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const id = match?.params?.id;
  const query = useQuery();

  const getList = useCallback<() => Observable<Song[]>>(() => {
    const storage = localStorage.getItem(USER_INFO_EXTRA);
    if (id && storage) {
      const parsed = queryParse(JSON.parse(storage).loginParams.query);
      return get('https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg', {
        type: 1,
        json: 1,
        utf8: 1,
        onlysong: 1,
        nosign: 1,
        new_format: 1,
        song_begin: queryRef.current.song_begin,
        song_num: queryRef.current.song_num,
        ctx: 1,
        disstid: id,
        _: Date.now(),
        g_tk_new_20200303: parsed.g_tk,
        g_tk: parsed.g_tk,
        loginUin: user.get('qq'),
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
            queryRef.current.song_total = res.total_song_num;
            setTotal(queryRef.current.song_total);
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
          return [];
        })
      );
    }
    return throwError(new Error('Prams parsed error'));
  }, [id, user]);
  const onPullingUp = useCallback(() => {
    const old = Object.assign({}, queryRef.current);
    queryRef.current.song_num += PAGE_NUM;
    queryRef.current.song_begin += PAGE_NUM;
    getList().subscribe(res => {
      setList(pre => pre.concat(res));
    }, err => {
      queryRef.current = old;
      console.error(err);
    });
  }, [getList]);

  useEffect(() => {
    setLoading(true);
    const subscription = getList().pipe(
      finalize(() => setLoading(false))
    ).subscribe(res => {
      setList(res);
    }, err => {
      console.error(err);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [getList]);
  useEffect(() => {
    if (query.title) {
      setTitle(decodeURIComponent(query.title));
    }
  }, [query]);

  return (
    <Structure
      className={'collections-detail'}
      header={
        <div className={'cd-detail-header'}>
          <Link to={'/collections'} replace>
            <ArrowLeftOutlined className={'back'} />
          </Link>
          <h1 className={'cd-title'}>{title}</h1>
        </div>
      }
    >
      {
        loading ?
          <Loading /> :
          <SongList list={list} className={'cd-detail-list'} total={total} onPullingUp={onPullingUp} />
      }
    </Structure>
  );
};

export { CollectionDetail };
