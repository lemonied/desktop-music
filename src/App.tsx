import React, { FC, useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AsyncLoad } from './components/async-load';
import { routes } from './routes';
import './App.less';
import { Structure } from './business/structure';
import { Header } from './business/header';
import { useRefreshUserInfo } from './store/actions/user-info';
import { useUserInfo } from './store/reducers/user-info';
import { Spin } from 'antd';

const App: FC = () => {
  const refreshUserInfo = useRefreshUserInfo();
  const userInfo = useUserInfo();

  useEffect(() => {
    refreshUserInfo();
  }, [refreshUserInfo]);

  return (
    <Structure
      header={<Header />}
      className={'root-container'}
    >
      {
        userInfo.get('status') === -1 ?
          <div className={'spin-wrapper'}>
            <Spin size={'large'} />
          </div> :
          <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Switch>
              {
                routes.map(item => (
                  <Route exact={item.exact} path={item.path} key={item.path}>
                    <AsyncLoad load={item.component}/>
                  </Route>
                ))
              }
            </Switch>
          </BrowserRouter>
      }
    </Structure>
  );
};

export default App;
