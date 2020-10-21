import React, { FC, ReactNode } from 'react';
import './style.scss';
import { combineClassNames } from '../../helpers/utils';

interface Props {
  header?: ReactNode;
  slider?: ReactNode;
  footer?: ReactNode;
  extra?: ReactNode;
  className?: string;
}

const Structure: FC<Props> = (props) => {
  const {
    children,
    header,
    slider,
    footer,
    extra,
    className
  } = props;

  return (
    <section className={combineClassNames(className, 'structure')}>
      {
        header ?
          <header>{ header }</header> :
          null
      }
      <section className={'content-middle'}>
        {
          slider ?
            <aside>{ slider }</aside> :
            null
        }
        <main className={'content-main'}>{ children }</main>
      </section>
      { extra }
      <footer>{ footer }</footer>
    </section>
  );
};

export { Structure };
