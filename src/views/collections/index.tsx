import React, { FC } from 'react';
import { Structure } from '../../components/structure';
import { Loading } from '../../components/loading';
import { Route, Link, useLocation } from 'react-router-dom';
import './style.scss';
import { CollectionDetail } from './detail';
import { CSSTransition } from 'react-transition-group';
import { Empty } from '../../components/empty';
import { useCD, useCDLoading } from './store/reducers';

const Collections: FC = () => {

  const list = useCD();
  const loading = useCDLoading();
  const location = useLocation();

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
                classNames={'opacity'}
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
              list.size ?
                <div
                  className={'cd-content'}
                >
                  <ul className={'cd-list'}>
                    {
                      list.map(v => {
                        return (
                          <li key={v.get('dissid')} className={'cd'}>
                            <div className={'cover'}>
                              <div className={'cover-wrapper'}>
                                <img src={v.get('picurl')} alt={v.get('title')} />
                              </div>
                            </div>
                            <Link replace className={'diss-name'} to={`/collections/${v.get('dissid')}?title=${v.get('title')}`}>{v.get('title')}</Link>
                            <div className={'listen-count'}>{v.get('subtitle')}</div>
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
