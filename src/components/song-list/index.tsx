import React, { FC } from 'react';
import { Music } from './music';
import './style.scss';
import { Empty } from '../empty';

interface Props {
  list: Music[];
}
const SongList: FC<Props> = (props) => {
  const { list } = props;

  return (
    <div className={'songs-list-wrapper'}>
      {
        list.length ?
          <ul className={'songs-list'}>
            {
              list.map(item => {
                return (
                  <li key={item.songid}>{item.name}</li>
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
