import React, { FC, useCallback, useEffect, useRef } from 'react';
import './style.scss';
import { Empty } from '../empty';
import { useSetPlayingList } from '../player/store/actions';
import { Song, useCurrentSong } from '../player/store/reducers';
import { combineClassNames } from '../../helpers/utils';
import wave from '../../common/images/wave.gif';
import vip from '../../common/images/vip.png';
import { ScrollY, ScrollYInstance, ScrollYProps } from '../scroll-y';
import { CloseOutlined } from '@ant-design/icons';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

interface Props {
  list: Song[];
  className?: string;
  onPullingUp?: ScrollYProps['onPullingUp'];
  total?: number;
  onDel?: (song: Song, index: number) => void;
  onClick?: (song: Song, index: number) => void;
  rollToActive?: boolean;
}
const SongList: FC<Props> = (props) => {
  const { list, className, total, onPullingUp, onDel, onClick, rollToActive = false } = props;
  const setPlayingList = useSetPlayingList();
  const currentSong = useCurrentSong();
  const scrollRef = useRef<ScrollYInstance>();
  const listRef = useRef<HTMLUListElement>(null);
  const initRef = useRef({ list, currentSong, rollToActive });

  const onSongClick = useCallback((song: Song, key: number) => {
    if (onClick) {
      onClick(song, key);
    } else {
      setPlayingList(list, key);
    }
  }, [list, setPlayingList, onClick]);

  useEffect(() => {
    let timer: any;
    if (total && total <= list.length) {
      scrollRef.current?.refresh();
      scrollRef.current?.closePullUp();
    } else {
      timer = setTimeout(() => {
        scrollRef.current?.refresh();
        scrollRef.current?.finishPullUp();
      }, 300);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [list, total]);

  useEffect(() => {
    const index = initRef.current.list.findIndex(v => v.songid === initRef.current.currentSong?.get('songid'));
    if (initRef.current.rollToActive && index > -1) {
      const li =  listRef.current?.getElementsByTagName('li')[index];
      if (li) {
        scrollRef.current?.scrollToElement(li, 0, false, 0);
      }
    }
  }, []);

  return (
    <div className={combineClassNames('songs-list-wrapper', className)}>
      {
        list.length ?
          <ScrollY ref={scrollRef} onPullingUp={onPullingUp}>
            <ul className={'songs-list'} ref={listRef}>
              <TransitionGroup>
                {
                  list.map((item, key) => {
                    return (
                      <CSSTransition
                        timeout={300}
                        classNames={'del'}
                        unmountOnExit
                        key={item.songid}
                      >
                        <li
                          className={combineClassNames(currentSong?.get('songid') === item.songid ? 'playing' : null)}
                        >
                          {
                            currentSong?.get('songid') === item.songid ?
                              <div className={'wave'}><img src={wave} alt="wave"/></div> :
                              null
                          }
                          {
                            item.vip ?
                              <div className={'vip'}><img src={vip} alt="vip"/></div> :
                              null
                          }
                          <div
                            className={'title'}
                          >
                            <span
                              title={`${item.name} - ${item.singer}`}
                              onClick={() => onSongClick(item, key)}
                            >{item.name} - {item.singer}</span>
                          </div>
                          <div className={'operations'}>
                            {
                              onDel ?
                                <CloseOutlined onClick={() => onDel(item, key)} /> :
                                null
                            }
                          </div>
                        </li>
                      </CSSTransition>
                    );
                  })
                }
              </TransitionGroup>
            </ul>
          </ScrollY> :
          <Empty />
      }
    </div>
  );
};

export { SongList };
