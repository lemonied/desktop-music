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
  onDel?: (song: Song) => void;
  onClick?: (song: Song, index: number) => void;
}
const SongList: FC<Props> = (props) => {
  const { list, className, total, onPullingUp, onDel, onClick } = props;
  const setPlayingList = useSetPlayingList();
  const currentSong = useCurrentSong();
  const scrollRef = useRef<ScrollYInstance>();

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

  return (
    <div className={combineClassNames('songs-list-wrapper', className)}>
      {
        list.length ?
          <ScrollY ref={scrollRef} onPullingUp={onPullingUp}>
            <ul className={'songs-list'}>
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
                                <CloseOutlined onClick={() => onDel(item)} /> :
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
