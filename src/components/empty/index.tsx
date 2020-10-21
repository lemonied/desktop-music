import React, { FC, ReactNode } from 'react';
import noResult from '../../common/images/no-result@3x.png';
import './style.scss';
import { combineClassNames } from '../../helpers/utils';

interface Props {
  content?: ReactNode;
  className?: string;
}
const Empty: FC<Props> = (props) => {
  const { content = '暂无数据', className } = props;

  return (
    <div className={combineClassNames('empty', className)}>
      <img src={noResult} alt="chicken"/>
      <div className={'desc'}>{ content }</div>
    </div>
  );
};

export { Empty };
