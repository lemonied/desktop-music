import React, { FC, useMemo } from 'react';
import { Structure } from '../structure';
import { FullLyric } from '../player/full';
import { FullscreenExitOutlined } from '@ant-design/icons';
import './style.scss';
import { useSetCurrentSong, useSetFullscreen } from '../player/store/actions';
import { combineClassNames } from '../../helpers/utils';
import { Radio } from 'antd';
import { CSSTransition } from 'react-transition-group';
import { SongList } from '../song-list';
import { usePlayingList } from '../player/store/reducers';
import { useCurrentTab } from './store/reducers';
import { useSetCurrentTab } from './store/actions';

interface Props {
  className?: string;
}

const PlayingList: FC<Props> = (props) => {
  const { className } = props;
  const setFullscreen = useSetFullscreen();
  const currentTab = useCurrentTab();
  const setCurrentTab = useSetCurrentTab();
  const playingList = usePlayingList();
  const setCurrentSong = useSetCurrentSong();

  const formattedList = useMemo(() => {
    return playingList.toJS();
  }, [playingList]);

  return (
    <Structure
      className={combineClassNames(className)}
      header={
        <div className={'playing-list-header'}>
          <FullscreenExitOutlined
            title={'收起'}
            className={'exit-fullscreen'}
            onClick={() => setFullscreen(false)}
          />
          <Radio.Group
            buttonStyle="solid"
            value={currentTab}
            onChange={e => setCurrentTab(e.target.value)}
          >
            <Radio.Button value={0}>播放列表</Radio.Button>
            <Radio.Button value={1}>正在播放</Radio.Button>
          </Radio.Group>
        </div>
      }
    >
      <div className={'playing-list-wrapper'}>
        <div className={'group-wrapper'}>
          <CSSTransition
            timeout={300}
            classNames={'fade'}
            unmountOnExit
            key={'list'}
            in={currentTab === 0}
          >
            <SongList
              list={formattedList}
              onClick={(song, key) => setCurrentSong(key)}
              rollToActive
            />
          </CSSTransition>
          <CSSTransition
            timeout={300}
            classNames={'fade'}
            unmountOnExit
            key={'lyric'}
            in={currentTab === 1}
          >
            <FullLyric />
          </CSSTransition>
        </div>
      </div>
    </Structure>
  );
};

export { PlayingList };
