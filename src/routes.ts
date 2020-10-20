interface Route {
  path: string;
  exact: boolean;
  component: () => Promise<any>;
}

const injectRoutes: any[] = JSON.parse(process.env.REACT_APP_ROUTES as string);

export const routes: Route[] = injectRoutes.map(route => {
  return {
    path: route.path,
    exact: route.exact,
    component: () => import(`./${route.filePath}`)
  };
});
