import React, { FC, useEffect, useState } from 'react';
import { Structure } from '../../components/structure';
import { useRanks } from './store/reducers';
import { useGetRanks } from './store/actions';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Content } from '../../business/content';
import { Loading } from '../../components/loading';
import './style.scss';

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
      ).subscribe(res => console.log(res));
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
  return (
    <Structure
      className={'home'}
    >
      <Content className={'home-content'}>
        {
          ranks.map(item => {
            return (
              <div key={item.id} className={'rank'}>
                <div className={'rank-wrapper'}>
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
                </div>
              </div>
            );
          })
        }
      </Content>
    </Structure>
  );
};

export default Home;
