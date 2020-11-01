import React, { FC, useCallback } from 'react';
import { Structure } from '../../components/structure';
import { useFavoriteLoading, useFavorites } from './store/reducers';
import { SongList } from '../../components/song-list';
import './style.scss';
import { Loading } from '../../components/loading';
import { Song } from '../../components/player/store/reducers';
import { useDelFavorite } from './store/actions';

const Favorite: FC = () => {
  const favorites = useFavorites();
  const loading = useFavoriteLoading();
  const delFavorite = useDelFavorite();

  const onDel = useCallback((song: Song) => {
    delFavorite(song).subscribe();
  }, [delFavorite]);

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
          <SongList list={favorites} onDel={onDel} />
      }
    </Structure>
  );
};

export default Favorite;
