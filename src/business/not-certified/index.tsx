import React, { FC, Fragment } from 'react';
import { useLogin } from '../../store/actions/user-info';
import { Empty } from '../../components/empty';
import { Button } from 'antd';
import './style.scss';

interface Props {}
const NotCertified: FC<Props> = () => {
  const login = useLogin();

  return (
    <Empty
      className={'not-certified'}
      content={
        <Fragment>
          <span>尚未登录，请</span>
          <Button type="link" onClick={login}>登录</Button>
          <span>后访问</span>
        </Fragment>
      }
    />
  );
};

export { NotCertified };
