import React, { FC, useCallback, Fragment } from 'react';
import Logo from '../../common/images/logo.png';
import './style.scss';
import { MinusOutlined, CloseOutlined } from '@ant-design/icons';
import { useUserInfo } from '../../store/reducers/user-info';
import { useLogin } from '../../store/actions/user-info';
import { Avatar } from 'antd';

const { win } = (window as any).globalvars;

interface Props {

}
const Header: FC<Props> = () => {
  const userInfo = useUserInfo();
  const login = useLogin();
  const onClose = useCallback(() => {
    win.hide();
  }, []);
  const onMinimize = useCallback(() => {
    win.minimize();
  }, []);
  const onLogin = useCallback(() => {
    login();
  }, [login]);

  return (
    <div className={'glo-header'}>
      <div className={'app-icon'}>
        <img src={Logo} alt="logo" className={'logo'} />
      </div>
      <div className={'user-name'}>
        {
          userInfo.get('status') === 0 ?
            <span className={'not-login'} onClick={onLogin}>未登录</span> :
            <Fragment>
              <Avatar src={userInfo.get('avatar')} />
              <span className={'nick'}>{userInfo.get('nick')}</span>
            </Fragment>
        }
      </div>
      <div className={'operation'}>
        <div className={'minimize'} onClick={onMinimize}>
          <MinusOutlined />
        </div>
        <div className={'close'} onClick={onClose}>
          <CloseOutlined />
        </div>
      </div>
    </div>
  );
};

export { Header };
