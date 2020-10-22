import React, { CSSProperties, FC } from 'react';
import { combineClassNames } from '../../helpers/utils';
import './style.scss';

interface Props {
  className?: string;
  style?: CSSProperties;
}
const Content: FC<Props> = (props) => {
  const { className, children, style } = props;

  return (
    <div className={combineClassNames('normal-content', className)} style={style}>{ children }</div>
  );
};

export { Content };
