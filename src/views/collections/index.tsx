import React, { FC, useCallback, useEffect, useState } from 'react';
import { Structure } from '../../components/structure';
import { USER_INFO_EXTRA } from '../../store/types';
import { get } from '../../helpers/http';
import { Observable, throwError } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { Loading } from '../../components/loading';
import { Route, Link, useLocation } from 'react-router-dom';
import './style.scss';
import { CollectionDetail } from './detail';
import { CSSTransition } from 'react-transition-group';
import defaultCD from '../../common/images/default-cd.png';
import { Empty } from '../../components/empty';

const Collections: FC = () => {

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<any[]>([]);
  const location = useLocation();

  const getList = useCallback<() => Observable<any[]>>(() => {
    const userInfoExtra = localStorage.getItem(USER_INFO_EXTRA);
    if (userInfoExtra) {
      const parsed = JSON.parse(userInfoExtra);
      return get(parsed.diss.href).pipe(
        map(res => {
          if (res.code === 0) {
            return res.data.mydiss.list;
          }
          return [];
        })
      );
    }
    return throwError(new Error('Cant get USER_INFO_EXTRA'));
  }, []);

  useEffect(() => {
    setLoading(true);
    const subscription = getList().pipe(
      tap(res => setList(res)),
      finalize(() => setLoading(false))
    ).subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [getList]);

  return (
    <Structure
      className={'collections'}
      header={
        <CSSTransition
          timeout={300}
          classNames={'opacity'}
          in={location.pathname === '/collections'}
          unmountOnExit
        >
          <h1 className={'cd-title'}>我的歌单</h1>
        </CSSTransition>
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
      <CSSTransition
        timeout={300}
        classNames={'opacity'}
        in={location.pathname === '/collections'}
        unmountOnExit
      >
        <div
          style={{height: '100%'}}
        >
          {
            loading ?
              <Loading /> :
              list.length ?
                <div
                  className={'cd-content'}
                >
                  <ul className={'cd-list'}>
                    {
                      list.map(v => {
                        return (
                          <li key={v.dissid} className={'cd'}>
                            <div className={'cover'}>
                              <div className={'cover-wrapper'}>
                                <img src={v.picurl || defaultCD} alt={v.title} />
                              </div>
                            </div>
                            <Link replace className={'diss-name'} to={`/collections/${v.dissid}?title=${v.title}`}>{v.title}</Link>
                            <div className={'listen-count'}>{v.subtitle.trim()}</div>
                          </li>
                        );
                      })
                    }
                  </ul>
                </div> :
                <Empty/>
          }
        </div>
      </CSSTransition>
    </Structure>
  );
};

export default Collections;
