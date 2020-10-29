import Home from './views/home';
import User from './views/user';
import Collections from './views/collections';
import Favorite from './views/favorite';

interface Route {
  path: string;
  exact: boolean;
  auth: boolean;
  component: any;
}

export const routes: Route[] = [{
  path: '/user',
  exact: true,
  auth: true,
  component: User
}, {
  path: '/favorite',
  exact: true,
  auth: true,
  component: Favorite
}, {
  path: '/collections',
  exact: false,
  auth: true,
  component: Collections
}, {
  path: '/',
  exact: false,
  auth: false,
  component: Home
}];
