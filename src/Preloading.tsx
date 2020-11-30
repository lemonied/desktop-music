import { FC, useEffect } from 'react';
import { finalize } from 'rxjs/operators';
import { favorites, favoriteLoading } from './views/favorite/store';
import { cd, cdLoading } from './views/collections/store';
import { userInfo as userInfoStore } from './store/user-info';

const Preloading: FC = () => {
  const userInfo = userInfoStore.use();

  useEffect(() => {
    if (userInfo.get('status') === 1) {
      favoriteLoading.set(true);
      favorites.getFavorites().pipe(
        finalize(() => favoriteLoading.set(false))
      ).subscribe();
    }
  }, [userInfo]);
  
  useEffect(() => {
    if (userInfo.get('status') === 1) {
      cdLoading.set(true);
      cd.getCD().pipe(
        finalize(() => cdLoading.set(false))
      ).subscribe();
    }
  }, [userInfo]);
  
  return null;
};

export { Preloading };
