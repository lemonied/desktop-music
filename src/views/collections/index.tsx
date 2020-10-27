import React, { FC, useCallback, useEffect, useState } from 'react';
import { Content } from '../../components/content';
import { Structure } from '../../components/structure';
import { USER_INFO_EXTRA } from '../../store/types';
import { get } from '../../helpers/http';
import { Observable, throwError } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { Loading } from '../../components/loading';
import { Route, Link, useLocation } from 'react-router-dom';
import './style.scss';
import { CollectionDetail } from './detail';
import { CSSTransition } from 'react-transition-group';

const Collections: FC = () => {

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const location = useLocation();

  const getList = useCallback<() => Observable<any[]>>(() => {
    const userInfoExtra = localStorage.getItem(USER_INFO_EXTRA);
    if (userInfoExtra) {
      const parsed = JSON.parse(userInfoExtra);
      setLoading(true);
      return get(parsed.diss.href).pipe(
        map(res => {
          if (res.code === 0) {
            return res.data.mydiss.list;
          }
          return [];
        }),
        finalize(() => setLoading(false))
      );
    }
    return throwError(new Error('Cant get USER_INFO_EXTRA'));
  }, []);

  useEffect(() => {
    getList().subscribe(res => setList(res));
  }, [getList]);

  return (
    <Structure
      className={'collections'}
      header={
        <h1 className={'title'}>我的歌单</h1>
      }
      extra={
        <Route path={'/collections/:id'} exact={false}>
          {
            ({ match }) => (
              <CSSTransition
                in={match !== null}
                timeout={300}
                classNames={'slide'}
                unmountOnExit
              >
                <CollectionDetail />
              </CSSTransition>
            )
          }
        </Route>
      }
    >
      {
        loading ?
          <Loading /> :
          <Content
            className={'cd-content'}
            style={{
              opacity: location.pathname === '/collections' ? 1 : 0
            }}
          >
            <ul className={'cd-list'}>
              {
                list.map(v => {
                  return (
                    <li key={v.dissid} className={'cd'}>
                      <div className={'cover'}>
                        <img src={v.picurl || 'https://y.gtimg.cn/mediastyle/global/img/cover_playlist.png?max_age=31536000'} alt={v.title} />
                      </div>
                      <Link className={'diss-name'} to={`/collections/${v.dissid}`}>{v.title}</Link>
                      <div className={'listen-count'}>{v.subtitle.trim()}</div>
                    </li>
                  );
                })
              }
            </ul>
          </Content>
      }
    </Structure>
  );
};

export default Collections;
