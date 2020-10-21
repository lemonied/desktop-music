interface Route {
  path: string;
  exact: boolean;
  auth: boolean;
  component: () => Promise<any>;
}

const injectRoutes: any[] = JSON.parse(process.env.REACT_APP_ROUTES as string);

export const routes: Route[] = injectRoutes.map(route => {
  return {
    path: route.path,
    exact: route.exact,
    auth: !!route.auth,
    component: () => import(`./${route.filePath}`)
  };
});
