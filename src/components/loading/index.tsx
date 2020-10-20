import React, { CSSProperties, FC, ReactNode } from 'react';
import { Icon } from '../icon';
import { combineClassNames } from '../../helpers/utils';
import './style.scss';

interface LoadingProps {
  title?: ReactNode;
  style?: CSSProperties;
  icon?: ReactNode;
  className?: string;
}

const defaultProps: LoadingProps = {
  style: { padding: '8px 0' }
};

const Loading: FC<LoadingProps> = function(props) {
  const { title, style, icon, className } = props;
  return (
    <div className={combineClassNames('windy-loading', className)} style={ style }>
      {
        typeof icon === 'undefined' ?
          <Icon type={'loading'} className={'loading-animation'} /> :
          typeof icon === 'string' ?
            <Icon type={icon} /> :
            icon
      }
      {
        title ?
          <span className={'title'}>{ title }</span> :
          null
      }
    </div>
  );
};
Loading.defaultProps = defaultProps;

export { Loading };
