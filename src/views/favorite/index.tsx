import React, { FC } from 'react';
import { Structure } from '../../components/structure';
import { useFavoriteLoading, useFavorites } from './store/reducers';
import { SongList } from '../../components/song-list';
import './style.scss';
import { Loading } from '../../components/loading';

const Favorite: FC = () => {
  const favorites = useFavorites();
  const loading = useFavoriteLoading();

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
          <SongList list={favorites}/>
      }
    </Structure>
  );
};

export default Favorite;
