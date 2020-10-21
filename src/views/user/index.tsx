import React, { FC, useCallback } from 'react';
import { useUserInfo } from '../../store/reducers/user-info';
import { Avatar, Button } from 'antd';
import './style.scss';
import { useLogout } from '../../store/actions/user-info';
import { LogoutOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { Modal } from '../../helpers/modal';
import { Content } from '../../business/content';

interface Props {}
const User: FC<Props> = () => {
  const userInfo = useUserInfo();
  const logout = useLogout();
  const history = useHistory();

  const confirmLogout = useCallback(() => {
    Modal.confirm({
      content: '确定注销登录？',
      onOk() {
        logout();
        history.push('/');
      }
    });
  }, [logout, history]);

  return (
    <Content className={'user-center'}>
      <div className={'main-info'}>
        <Avatar size={100} src={userInfo.get('avatar')} />
        <div className={'nick-and-qq'}>
          <div>昵称：{userInfo.get('nick')}</div>
          <div>QQ号：{userInfo.get('qq')}</div>
        </div>
        <Button type="primary" danger onClick={confirmLogout} icon={<LogoutOutlined />}>注销登录</Button>
      </div>
    </Content>
  );
};

export default User;
