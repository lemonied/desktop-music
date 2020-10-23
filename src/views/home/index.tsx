import React, { FC, useEffect, useState } from 'react';
import { Structure } from '../../components/structure';
import { useRanks } from './store/reducers';
import { useGetRanks } from './store/actions';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Content } from '../../components/content';
import { Loading } from '../../components/loading';
import { HomeDetail } from './detail';
import { Route, Link } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import './style.scss';
import { Empty } from '../../components/empty';

interface Props {}

const Home: FC<Props> = () => {

  const ranks = useRanks();
  const getRanks = useGetRanks();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let subscription: Subscription;
    if (!ranks.size) {
      setLoading(true);
      subscription = getRanks().pipe(
        finalize(() => setLoading(false))
      ).subscribe();
    }
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [ranks, getRanks]);
  if (loading && !ranks.size) {
    return <Loading />;
  }
  if (!ranks.size) {
    return (
      <Empty />
    );
  }
  return (
    <Structure
      className={'home'}
    >
      <div className={'home-wrapper'}>
        <Content className={'home-content'}>
          <div className={'ranks-list'}>
            {
              ranks.map(item => {
                return (
                  <div key={item.id} className={'rank'}>
                    <Link className={'rank-wrapper'} to={`/${item.id}`} replace>
                      <div className={'poster'}>
                        <img src={item.picUrl} alt={item.topTitle}/>
                        <div className={'mask'} />
                        <div className={'hot'}>人气:{item.listenCount}</div>
                      </div>
                      <ul className={'eg-songs'}>
                        {
                          item.songList.map((v: any, i: number) => {
                            return (
                              <li key={i} title={`${v.songname} - ${v.singername}`}>{v.songname} - {v.singername}</li>
                            );
                          })
                        }
                      </ul>
                    </Link>
                  </div>
                );
              })
            }
          </div>
        </Content>
        <Route
          exact={false}
          path={'/:id'}
        >
          {
            ({ match }) => (
              <CSSTransition
                in={match !== null}
                timeout={300}
                classNames={'width'}
                unmountOnExit
              >
                <HomeDetail />
              </CSSTransition>
            )
          }
        </Route>
      </div>
    </Structure>
  );
};

export default Home;
