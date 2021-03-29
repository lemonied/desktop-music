import React, { FC, useEffect, useMemo, Fragment } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { routes } from './routes';
import './App.less';
import { Structure } from './components/structure';
import { Header } from './components/header';
import { userInfo as userInfoStore } from './store/user-info';
import { ConfigProvider } from 'antd';
import { Aside } from './components/aside';
import zhCN from 'antd/es/locale/zh_CN';
import { NotCertified } from './components/not-certified';
import { Loading } from './components/loading';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Player } from './components/player';
import { useCurrentSong, useFullscreen } from './components/player/store/reducers';
import { Preloading } from './Preloading';
import defaultBkg from './common/images/background.jpg';
import { PlayingList } from './components/playing-list';

const hasSubRouter = routes.filter(v => !v.exact).map(v => v.path);

const App: FC = () => {
  const userInfo = userInfoStore.use();
  const location = useLocation();
  const currentSong = useCurrentSong();
  const fullscreen = useFullscreen();

  const pathname = useMemo(() => {
    if (/^(\/)\d+$/.test(location.pathname)) {
      return RegExp.$1;
    }
    if (new RegExp(`^(${hasSubRouter.join('|')})\\/[^\\/]+$`).test(location.pathname)) {
      return RegExp.$1;
    }
    return location.pathname;
  }, [location]);
  useEffect(() => {
    userInfoStore.pullUserInfo().subscribe();
  }, []);

  return (
    <Fragment>
      <Preloading />
      <div className={'current-mask'} style={{backgroundImage: `url(${currentSong?.get('image') || defaultBkg})`}} />
      <ConfigProvider locale={zhCN}>
        <Structure
          className={'root-layout'}
          contentClassName={'root-content-middle'}
          header={<Header />}
          slider={
            userInfo.get('status') === -1 ?
              null :
              <Aside className={'root-aside'} style={{opacity: fullscreen ? 0 : 1}} />
          }
          footer={<Player />}
        >
          <div className={'root-content'} style={{opacity: fullscreen ? 0 : 1}}>
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
                                // eslint-disable-next-line react/jsx-pascal-case
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
          </div>
          <CSSTransition
            key={'current-song'}
            timeout={300}
            in={fullscreen}
            classNames={'fade'}
            unmountOnExit
          >
            <PlayingList className={'root-playing-wrapper'} />
          </CSSTransition>
        </Structure>
      </ConfigProvider>
    </Fragment>
  );
};

export default App;
