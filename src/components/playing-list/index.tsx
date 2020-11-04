import React, { FC, useState } from 'react';
import { Structure } from '../structure';
import { FullLyric } from '../player/full';
import { FullscreenExitOutlined } from '@ant-design/icons';
import './style.scss';
import { useSetFullscreen } from '../player/store/actions';
import { combineClassNames } from '../../helpers/utils';
import { Radio } from 'antd';

interface Props {
  className?: string;
}

const PlayingList: FC<Props> = (props) => {
  const { className } = props;
  const setFullscreen = useSetFullscreen();
  const [ currentTab, setCurrentTab ] = useState<'playing-list' | 'current-song'>('playing-list');

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
            <Radio.Button value={'playing-list'}>播放列表</Radio.Button>
            <Radio.Button value={'current-song'}>正在播放</Radio.Button>
          </Radio.Group>
        </div>
      }
    >
      <div className={'playing-list-wrapper'}>
        <FullLyric />
      </div>
    </Structure>
  );
};

export { PlayingList };
