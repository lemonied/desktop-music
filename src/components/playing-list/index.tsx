import React, { FC } from 'react';
import { Structure } from '../structure';
import { FullLyric } from '../player/full';
import { FullscreenExitOutlined } from '@ant-design/icons';
import './style.scss';
import { useCurrentSong } from '../player/store/reducers';
import { useSetFullscreen } from '../player/store/actions';
import { combineClassNames } from '../../helpers/utils';

interface Props {
  className?: string;
}

const PlayingList: FC<Props> = (props) => {
  const { className } = props;
  const currentSong = useCurrentSong();
  const setFullscreen = useSetFullscreen();

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
          <h1>{ currentSong?.get('name') }</h1>
        </div>
      }
    >
      <FullLyric />
    </Structure>
  );
};

export { PlayingList };
