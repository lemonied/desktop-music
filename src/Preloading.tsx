import { FC, useEffect } from 'react';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { useSetFavoriteLoading, useGetFavorite, useSetFavorite } from './views/favorite/store/actions';
import { useGetCD, useSetCD, useSetCDLoading } from './views/collections/store/actions';
import { useUserInfo } from './store/reducers/user-info';

const Preloading: FC = () => {
  const getFavorites = useGetFavorite();
  const setFavoriteLoading = useSetFavoriteLoading();
  const getCD = useGetCD();
  const setCDLoading = useSetCDLoading();
  const userInfo = useUserInfo();
  const setFavorites = useSetFavorite();
  const setCD = useSetCD();

  useEffect(() => {
    if (userInfo.get('status') === 1) {
      setFavoriteLoading(true);
      getFavorites().pipe(
        finalize(() => setFavoriteLoading(false)),
        catchError(err => {
          console.error(err);
          return of({});
        })
      ).subscribe();
    } else {
      setFavorites([]);
    }
  }, [getFavorites, setFavoriteLoading, setFavorites, userInfo]);
  
  useEffect(() => {
    if (userInfo.get('status') === 1) {
      setCDLoading(true);
      getCD().pipe(
        finalize(() => setCDLoading(false)),
        catchError(err => {
          console.error(err);
          return of({});
        })
      ).subscribe();
    } else {
      setCD([]);
    }
  }, [getCD, setCD, setCDLoading, userInfo]);
  
  return null;
};

export { Preloading };
