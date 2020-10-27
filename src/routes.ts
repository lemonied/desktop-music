import Home from './views/home';
import User from './views/user';
import Collections from './views/collections';

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
