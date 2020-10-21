import React, { FC, useCallback } from 'react';
import './style.scss';
import { MinusOutlined, CloseOutlined } from '@ant-design/icons';

const { win } = (window as any).globalvars;

interface Props {

}
const Header: FC<Props> = () => {
  const onClose = useCallback(() => {
    win.hide();
  }, []);
  const onMinimize = useCallback(() => {
    win.minimize();
  }, []);

  return (
    <div className={'glo-header'}>
      <div className={'app-drag'} />
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
