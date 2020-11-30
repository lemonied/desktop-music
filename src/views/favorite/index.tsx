import React, { FC, useCallback } from 'react';
import { Structure } from '../../components/structure';
import { favorites, favoriteLoading } from './store';
import { SongList } from '../../components/song-list';
import './style.scss';
import { Loading } from '../../components/loading';
import { Song } from '../../components/player/store/reducers';

const Favorite: FC = () => {
  const list = favorites.use();
  const loading = favoriteLoading.use();

  const onDel = useCallback((song: Song) => {
    favorites.delFavorite(song).subscribe();
  }, []);

  return (
    <Structure
      className={'favorite-list'}
      header={
        <h1 className={'cd-title'}>我喜欢</h1>
      }
    >
      {
        loading ?
          <Loading /> :
          <SongList list={list} onDel={onDel} />
      }
    </Structure>
  );
};

export default Favorite;
