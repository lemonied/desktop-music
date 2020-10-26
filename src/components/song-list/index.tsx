import React, { FC, useCallback } from 'react';
import { Music } from './music';
import './style.scss';
import { Empty } from '../empty';
import { useSetPlayingList } from '../player/store/actions';
import { Song, useCurrentSong } from '../player/store/reducers';
import { combineClassNames } from '../../helpers/utils';
import wave from '../../common/images/wave.gif';
import vip from '../../common/images/vip.png';

interface Props {
  list: Music[];
  className?: string;
}
const SongList: FC<Props> = (props) => {
  const { list, className } = props;
  const setPlayingList = useSetPlayingList();
  const currentSong = useCurrentSong();

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

  return (
    <div className={combineClassNames('songs-list-wrapper', className)}>
      {
        list.length ?
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
          </ul> :
          <Empty />
      }
    </div>
  );
};

export { SongList };
