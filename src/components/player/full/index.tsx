import React, { FC, useEffect, useRef } from 'react';
import { Structure } from '../../structure';
import { ScrollY, ScrollYInstance } from '../../scroll-y';
import { useCurrentLyricNum, useLyric } from '../store/reducers';
import { combineClassNames } from '../../../helpers/utils';
import './style.scss';

const FullLyric: FC = () => {
  const lyric = useLyric();
  const ulRef = useRef<HTMLUListElement>(null);
  const scroll = useRef<ScrollYInstance>();
  const lyricNum = useCurrentLyricNum();

  useEffect(() => {
    const li =  ulRef.current?.getElementsByTagName('li')[lyricNum];
    if (li) {
      scroll.current?.scrollToElement(li, 1000, false, true);
    }
  }, [lyricNum]);

  return (
    <Structure
      className={'full-player'}
    >
      <ScrollY
        ref={scroll}
        className={'lyric-list'}
        scrollBar={false}
      >
        <ul ref={ulRef}>
          {
            lyric.map((item, key) => {
              return (
                <li key={key} className={combineClassNames(key === lyricNum ? 'active' : null)}>{ item.txt }</li>
              );
            })
          }
        </ul>
      </ScrollY>
    </Structure>
  );
};

export { FullLyric };
