import React, { FC, useCallback } from 'react';
import { Music } from './music';
import './style.scss';
import { Empty } from '../empty';
import { useSetCurrentSong, useSetPlayingList } from '../player/store/actions';
import { Song } from '../player/player';

interface Props {
  list: Music[];
}
const SongList: FC<Props> = (props) => {
  const { list } = props;
  const setPlayingList = useSetPlayingList();
  const setCurrentSong = useSetCurrentSong();

  const onClick = useCallback((song: Song) => {
    setCurrentSong(song);
    setPlayingList(list.map(v => {
      return {
        name: v.name,
        singer: v.singer,
        image: v.image,
        duration: v.duration
      };
    }));
  }, [list, setPlayingList, setCurrentSong]);

  return (
    <div className={'songs-list-wrapper'}>
      {
        list.length ?
          <ul className={'songs-list'}>
            {
              list.map(item => {
                return (
                  <li key={item.songid} onClick={() => onClick(item)}>
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
