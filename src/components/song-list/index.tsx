import React, { FC, useCallback } from 'react';
import { Music } from './music';
import './style.scss';
import { Empty } from '../empty';
import { useSetPlayingList } from '../player/store/actions';
import { Song } from '../player/store/reducers';

interface Props {
  list: Music[];
}
const SongList: FC<Props> = (props) => {
  const { list } = props;
  const setPlayingList = useSetPlayingList();

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
    <div className={'songs-list-wrapper'}>
      {
        list.length ?
          <ul className={'songs-list'}>
            {
              list.map((item, key) => {
                return (
                  <li key={item.songid} onClick={() => onClick(item, key)}>
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
