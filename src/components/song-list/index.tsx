import React, { FC, useCallback, useEffect, useRef } from 'react';
import { Music } from './music';
import './style.scss';
import { Empty } from '../empty';
import { useSetPlayingList } from '../player/store/actions';
import { Song, useCurrentSong } from '../player/store/reducers';
import { combineClassNames } from '../../helpers/utils';
import wave from '../../common/images/wave.gif';
import vip from '../../common/images/vip.png';
import { ScrollY, ScrollYInstance, ScrollYProps } from '../scroll-y';

interface Props {
  list: Music[];
  className?: string;
  onPullingUp?: ScrollYProps['onPullingUp'];
  total?: number;
}
const SongList: FC<Props> = (props) => {
  const { list, className, total, onPullingUp } = props;
  const setPlayingList = useSetPlayingList();
  const currentSong = useCurrentSong();
  const scrollRef = useRef<ScrollYInstance>();

  const onClick = useCallback((song: Song, key: number) => {
    setPlayingList(list.map(v => {
      return {
        name: v.name,
        singer: v.singer,
        image: v.image,
        duration: v.duration,
        songid: v.songid,
        songmid: v.songmid
      };
    }), key);
  }, [list, setPlayingList]);

  useEffect(() => {
    let timer: any;
    if (total && total <= list.length) {
      scrollRef.current?.refresh();
      scrollRef.current?.closePullUp();
    } else {
      timer = setTimeout(() => {
        scrollRef.current?.refresh();
        scrollRef.current?.finishPullUp();
      }, 300);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [list, total]);

  return (
    <div className={combineClassNames('songs-list-wrapper', className)}>
      {
        list.length ?
          <ScrollY ref={scrollRef} onPullingUp={onPullingUp}>
            <ul className={'songs-list'}>
              {
                list.map((item, key) => {
                  return (
                    <li
                      key={item.songid}
                      onClick={() => onClick(item, key)}
                      className={combineClassNames(currentSong?.get('songid') === item.songid ? 'playing' : null)}
                    >
                      {
                        currentSong?.get('songid') === item.songid ?
                          <div className={'wave'}><img src={wave} alt="wave"/></div> :
                          null
                      }
                      {
                        item.vip ?
                          <div className={'vip'}><img src={vip} alt="vip"/></div> :
                          null
                      }
                      <div className={'title'} title={`${item.name} - ${item.singer}`}>{item.name} - {item.singer}</div>
                    </li>
                  );
                })
              }
            </ul>
          </ScrollY> :
          <Empty />
      }
    </div>
  );
};

export { SongList };
