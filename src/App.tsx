import React, { FC, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { AsyncLoad } from './components/async-load';
import { routes } from './routes';
import './App.less';
import { Structure } from './components/structure';
import { Header } from './business/header';
import { useRefreshUserInfo } from './store/actions/user-info';
import { useUserInfo } from './store/reducers/user-info';
import { ConfigProvider } from 'antd';
import { Aside } from './business/aside';
import zhCN from 'antd/es/locale/zh_CN';
import { NotCertified } from './business/not-certified';
import { Loading } from './components/loading';

const App: FC = () => {
  const refreshUserInfo = useRefreshUserInfo();
  const userInfo = useUserInfo();

  useEffect(() => {
    refreshUserInfo();
  }, [refreshUserInfo]);

  return (
    <ConfigProvider locale={zhCN}>
      <Structure
        header={<Header />}
        slider={
          userInfo.get('status') === -1 ?
            null :
            <Aside />
        }
      >
        {
          userInfo.get('status') === -1 ?
            <Loading /> :
            <Switch>
              {
                routes.map(item => (
                  <Route exact={item.exact} path={item.path} key={item.path}>
                    {
                      userInfo.get('status') !== 1 && item.auth ?
                        <NotCertified /> :
                        <AsyncLoad load={item.component}/>
                    }
                  </Route>
                ))
              }
            </Switch>
        }
      </Structure>
    </ConfigProvider>
  );
};

export default App;
