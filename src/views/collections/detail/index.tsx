import React, { FC, useCallback, useEffect } from 'react';
import { Structure } from '../../../components/structure';
import './style.scss';
import { get } from '../../../helpers/http';
import { useRouteMatch } from 'react-router-dom';
import { USER_INFO_EXTRA } from '../../../store/types';
import { queryParse } from '../../../helpers/query';
import { Observable, of } from 'rxjs';
import { useUserInfo } from '../../../store/reducers/user-info';
import { map } from 'rxjs/operators';

const CollectionDetail: FC = () => {
  const match = useRouteMatch<{id: string}>();
  const useInfo = useUserInfo();
  const id = match?.params?.id;

  const getList = useCallback<() => Observable<any>>(() => {
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
        song_begin: 0,
        song_num: 10,
        ctx: 1,
        disstid: id,
        _: Date.now(),
        g_tk_new_20200303: parsed.g_tk,
        g_tk: parsed.g_tk,
        loginUin: useInfo.get('qq'),
        hostUin: 0,
        format: 'json',
        inCharset: 'utf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq.json',
        needNewCode: 0
      }).pipe(
        map(res => {
          console.log(res);
        })
      );
    }
    console.error(new Error('Prams parsed error'));
    return of([]);
  }, [id, useInfo]);

  useEffect(() => {
    getList().subscribe();
  }, [getList]);

  return (
    <Structure
      className={'collections-detail'}
    >
      Hello World
    </Structure>
  );
};

export { CollectionDetail };
