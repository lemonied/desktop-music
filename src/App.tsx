import React, { FC, useEffect, useMemo, Fragment } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { routes } from './routes';
import './App.less';
import { Structure } from './components/structure';
import { Header } from './components/header';
import { useRefreshUserInfo } from './store/actions/user-info';
import { useUserInfo } from './store/reducers/user-info';
import { ConfigProvider } from 'antd';
import { Aside } from './components/aside';
import zhCN from 'antd/es/locale/zh_CN';
import { NotCertified } from './components/not-certified';
import { Loading } from './components/loading';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Player } from './components/player';
import { useCurrentSong } from './components/player/store/reducers';

const App: FC = () => {
  const refreshUserInfo = useRefreshUserInfo();
  const userInfo = useUserInfo();
  const location = useLocation();
  const currentSong = useCurrentSong();

  const pathname = useMemo(() => {
    if (/^\/\d*$/.test(location.pathname)) {
      return '/';
    }
    if (/^\/collections\/\d*$/.test(location.pathname)) {
      return '/collections';
    }
    return location.pathname;
  }, [location]);
  useEffect(() => {
    refreshUserInfo();
  }, [refreshUserInfo]);

  return (
    <Fragment>
      <div className={'current-mask'} style={{backgroundImage: `url(${currentSong?.get('image')})`}} />
      <ConfigProvider locale={zhCN}>
        <Structure
          className={'root-layout'}
          header={<Header />}
          slider={
            userInfo.get('status') === -1 ?
              null :
              <Aside />
          }
          footer={<Player />}
        >
          {
            userInfo.get('status') === -1 ?
              <Loading /> :
              <TransitionGroup
                className={'root-routes-group'}
              >
                <CSSTransition
                  key={pathname}
                  classNames={'fade'}
                  timeout={300}
                >
                  <div style={{ height: '100%', width: '100%', overflowY: 'auto' }}>
                    <Switch location={location}>
                      {
                        routes.map(Item => (
                          <Route
                            exact={Item.exact}
                            path={Item.path}
                            key={Item.path}
                            render={routeProps => {
                              if (userInfo.get('status') !== 1 && Item.auth) {
                                return (
                                  <NotCertified />
                                );
                              }
                              return <Item.component />;
                            }}
                          />
                        ))
                      }
                    </Switch>
                  </div>
                </CSSTransition>
              </TransitionGroup>
          }
        </Structure>
      </ConfigProvider>
    </Fragment>
  );
};

export default App;
