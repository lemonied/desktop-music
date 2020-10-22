import Home from './views/home';
import User from './views/user';

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
  path: '/',
  exact: false,
  auth: false,
  component: Home
}];
