import React, { FC, Fragment } from 'react';
import { userInfo } from '../../store/user-info';
import { Empty } from '../empty';
import { Button } from 'antd';
import './style.scss';

interface Props {}
const NotCertified: FC<Props> = () => {

  return (
    <Empty
      className={'not-certified'}
      content={
        <Fragment>
          <span>尚未登录，请</span>
          <Button type="link" onClick={userInfo.login}>登录</Button>
          <span>后访问</span>
        </Fragment>
      }
    />
  );
};

export { NotCertified };
