import React, { CSSProperties, FC, ReactNode } from 'react';
import { combineClassNames } from '../../helpers/utils';
import './style.scss';
import { Spin } from 'antd';
import { SpinSize } from 'antd/lib/spin';

interface LoadingProps {
  title?: ReactNode;
  style?: CSSProperties;
  className?: string;
  size?: SpinSize;
}

const Loading: FC<LoadingProps> = function(props) {
  const { title, style, className, size = 'large' } = props;
  return (
    <div
      className={combineClassNames('spin-wrapper', className)}
      style={style}
    >
      <Spin size={size} />
      {
        title ?
          <span className={'spin-txt'}>{ title }</span> :
          null
      }
    </div>
  );
};

export { Loading };
