import React, { FC, Fragment, useMemo } from 'react';
import { Structure } from '../structure';
import { UserOutlined } from '@ant-design/icons';
import logo from '../../common/images/logo@2x.png';
import './style.scss';
import { Avatar } from 'antd';
import { useUserInfo } from '../../store/reducers/user-info';
import { combineClassNames } from '../../helpers/utils';
import { NavLink, Link, useHistory, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

interface Props {}
const Aside: FC<Props> = () => {
  const userInfo = useUserInfo();
  const history = useHistory();
  const location = useLocation();

  const isHomeActive = useMemo<boolean>(() => {
    return location.pathname === '/' ||
      /^\/\d+$/.test(location.pathname);
  }, [location]);

  return (
    <Structure
      className={'aside'}
      header={
        <div className={'logo'} onClick={() => history.replace('/')}>
          <img src={logo} alt="logo"/>
          <h1>{process.env.REACT_APP_TITLE}</h1>
        </div>
      }
      footer={
        <div className={'aside-footer'}>
          <NavLink
            replace
            className={combineClassNames('user-name', 'link')}
            activeClassName={'active'}
            to={'/user'}
          >
            {
              userInfo.get('status') === 1 ?
                <Fragment>
                  <Avatar className={'prefix'} src={userInfo.get('avatar')} />
                  <span>{userInfo.get('nick')}</span>
                </Fragment> :
                <Fragment>
                  <Avatar className={'prefix'} icon={<UserOutlined />} />
                  <span className={'not-login'}>未登录</span>
                </Fragment>
            }
          </NavLink>
        </div>
      }
    >
      <div className={'left-menu'}>
        <Link to={'/'} className={combineClassNames('link', isHomeActive ? 'active' : null)}>
          <HomeOutlined className={'prefix'} />
          <span>热门榜单</span>
        </Link>
      </div>
    </Structure>
  );
};

export { Aside };
