import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import { CSSTransition } from 'react-transition-group';
import { Icon } from '../icon';
import { CircleProgress, LineProgress } from '../progress';
import { ScrollY, useScrollY } from '../scroll-y';
import { Lyric, LyricLine } from './lyric';
import { combineClassNames, prefixStyle } from '../../helpers/utils';
import './style.scss';

const transform = prefixStyle('transform');
const transitionDuration = prefixStyle('transitionDuration');

function timeFormat(t = 0) {
  const m = Math.round(t % 60);
  return `${Math.floor(t / 60)}:${m < 10 ? '0' + m : m}`;
}

export interface Song {
  duration: number; // seconds
  image: string; // image url
  name: string; // song name
  singer: string; // singer name
  url?: string; // play url
  like?: boolean; // like or dislike
}
export type PlayModes = 'loop' | 'sequence' | 'random';
interface PlayerInstance {
  play(): Promise<void>;
  pause(): void;
}
interface PlayerProps {
  className?: string;
  song?: Song;
  autoplay?: boolean;
  lyric?: string;
  list?: Song[];
  onLike?(): Promise<void>;
  onDislike?(): Promise<void>;
  onChange?(song: Song, index: number, mode: PlayModes): Promise<void>;
  onModeChange?(mode: PlayModes): void;
}
const PlayerFc: ForwardRefRenderFunction<PlayerInstance, PlayerProps> = function(props, ref) {
  const { song, lyric, className, autoplay = true, onLike, onDislike, onChange, onModeChange, list } = props;
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const playingRef = useRef(false);
  const lyricRef = useRef<Lyric>();
  const scroll = useScrollY();
  const miniImgRef = useRef<HTMLImageElement>(null);
  const normalImgRef = useRef<HTMLDivElement>(null);
  const lyricListRef = useRef<HTMLDivElement>(null);
  const middleLRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef({
    status: false,
    startX: 0,
    startY: 0,
    percent: 0
  });

  const [ fullScreen, setFullScreen ] = useState(false);
  const [ playing, setPlaying ] = useState(false);
  const [ percent, setPercent ] = useState(0);
  const [ fmtTime, setFmtTime ] = useState('');
  const [ totalTime, setTotalTime ] = useState('');
  const [ currentLyric, setCurrentLyric ] = useState('');
  const [ lyricLines, setLyricLines ] = useState<LyricLine[]>([]);
  const [ currentLine, setCurrentLine ] = useState<number>(0);
  const [ currentShow, setCurrentShow ] = useState<'cd' | 'lyric'>('cd');
  const [ playMode, setPlayMode ] = useState<PlayModes>('sequence');
  const [ like, setLike ] = useState<boolean>(!!song?.like);
  const [ isSwitching, setIsSwitching ] = useState(false);

  // On Operation
  const togglePlay = useCallback(() => {
    if (playingRef.current) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().then(() => {
        // playing
      });
    }
  }, []);
  const onNextClick = useCallback(() => {
    if (isSwitching) return;
    if (typeof onChange === 'function' && list && song) {
      setIsSwitching(true);
      let index: number;
      const i = list.indexOf(song);
      if (playMode === 'random') {
        index = getRandom(Math.max(i, 0), list.length);
      } else {
        index = (i + 1) % list.length;
      }
      onChange(list[index], index, playMode).then(() => {
        setIsSwitching(false);
      });
    }
  }, [isSwitching, onChange, list, song, playMode]);
  const onPreClick = useCallback(() => {
    if (isSwitching) return;
    if (typeof onChange === 'function' && list && song) {
      setIsSwitching(true);
      let index: number;
      const i = list.indexOf(song);
      if (playMode === 'random') {
        index = getRandom(Math.max(i, 0), list.length);
      } else if (i === 0) {
        index = list.length - 1;
      } else {
        index = (list.indexOf(song) - 1) % list.length;
      }
      onChange(list[index], index, playMode).then(() => {
        setIsSwitching(false);
      });
    }
  }, [isSwitching, onChange, list, song, playMode]);
  const onLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const isLike = !like;
    setLike(isLike);
    if (onLike && isLike) {
      onLike().catch(() => {
        setLike(false);
      });
    }
    if (onDislike && !isLike) {
      onDislike().catch(() => {
        setLike(true);
      });
    }
  }, [like, onLike, onDislike]);
  const toggleFullScreen = useCallback(() => {
    setFullScreen(pre => !pre);
  }, []);
  const changeMode = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const playModes: PlayModes[] = ['sequence', 'random', 'loop'];
    setPlayMode(prevState => {
      const index = (playModes.indexOf(prevState) + 1) % playModes.length;
      if (typeof onModeChange === 'function') onModeChange(playModes[index]);
      return playModes[index];
    });
  }, [onModeChange]);
  const onProgressChange = useCallback((percent: number) => {
    if (song) {
      const time = percent / 100 * song.duration;
      audioRef.current.currentTime = time;
      lyricRef.current?.seek(time * 1000);
    }
  }, [song]);

  // On Middle Touch
  const middleTouchStart = useCallback((e: React.TouchEvent) => {
    touchRef.current.status = true;
    touchRef.current.startX = e.touches[0].pageX;
    touchRef.current.startY = e.touches[0].pageY;
  }, []);
  const middleTouchMove = useCallback((e: React.TouchEvent) => {
    const lyricList = lyricListRef.current;
    if (!touchRef.current.status) return;
    const offsetY = e.touches[0].pageY - touchRef.current.startY;
    let offsetX = e.touches[0].pageX - touchRef.current.startX;
    if (Math.abs(offsetY) > Math.abs(offsetX)) return;
    const left = currentShow === 'cd' ? 0 : -document.body.clientWidth;
    offsetX = Math.max(-document.body.clientWidth, Math.min(offsetX + left, 0));
    touchRef.current.percent = Math.abs(offsetX / document.body.clientWidth);
    if (lyricList) {
      (lyricList.style as any)[transform] = `translate3d(${offsetX}px, 0, 0)`;
      (lyricList.style as any)[transitionDuration] = '';
    }
    if (middleLRef.current) {
      middleLRef.current.style.opacity = 1 - touchRef.current.percent + '';
    }
  }, [currentShow]);
  const middleTouchEnd = useCallback(() => {
    const lyricList = lyricListRef.current;
    touchRef.current.status = false;
    let offsetX: number;
    if (currentShow === 'cd') {
      if (touchRef.current.percent > 0.2) {
        offsetX = -document.body.clientWidth;
        setCurrentShow('lyric');
        if (middleLRef.current) middleLRef.current.style.opacity = '0';
        touchRef.current.percent = 1;
      } else {
        offsetX = 0;
        setCurrentShow('cd');
        if (middleLRef.current) middleLRef.current.style.opacity = '1';
        touchRef.current.percent = 0;
      }
    } else {
      if (touchRef.current.percent < 0.8) {
        offsetX = 0;
        setCurrentShow('cd');
        if (middleLRef.current) middleLRef.current.style.opacity = '1';
        touchRef.current.percent = 0;
      } else {
        offsetX = -document.body.clientWidth;
        setCurrentShow('lyric');
        if (middleLRef.current) middleLRef.current.style.opacity = '0';
        touchRef.current.percent = 1;
      }
    }
    if (lyricList) {
      (lyricList.style as any)[transform] = `translate3d(${offsetX}px, 0, 0)`;
      (lyricList.style as any)[transitionDuration] = `300ms`;
    }
    if (middleLRef.current) (middleLRef.current.style as any)[transitionDuration] = '300ms';
  }, [currentShow]);

  // On Fullscreen Animating
  const getMiniTransform = useCallback(() => {
    const mini = miniImgRef.current;
    const normal = normalImgRef.current;
    if (mini && normal) {
      const miniPos = mini.getBoundingClientRect();
      const normalPos = normal.getBoundingClientRect();
      const x = miniPos.x + miniPos.width / 2 - normalPos.x - normalPos.width / 2;
      const y = miniPos.y + miniPos.height / 2 - normalPos.y - normalPos.height / 2;
      (normal.style as any)[transform] = `translate(${x}px, ${y}px) scale(${miniPos.width / normalPos.width})`;
    }
  }, []);
  const onEnter = useCallback(() => {
    getMiniTransform();
  }, [getMiniTransform]);
  const onEntering = useCallback(() => {
    const normal = normalImgRef.current;
    if (normal) {
      normal.style.transition = 'all .4s ease';
      (normal.style as any)[transform] = '';
    }
  }, []);
  const onAfterEnter = useCallback(() => {}, []);
  const onLeave = useCallback(() => {
    const normal = normalImgRef.current;
    if (normal) {
      normal.style.transition = '';
      (normal.style as any)[transform] = '';
    }
  }, []);
  const onLeaving = useCallback(() => {
    getMiniTransform();
    if (normalImgRef.current) {
      normalImgRef.current.style.transition = 'all .4s ease';
    }
  }, [getMiniTransform]);
  const onAfterLeave = useCallback(() => {}, []);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.onpause = null;
      audio.ontimeupdate = null;
      audio.onplay = null;
      audio.onended = null;
      audio.pause();
      lyricRef.current?.stop();
    };
  }, []);
  useEffect(() => {
    audioRef.current.autoplay = autoplay;
  }, [autoplay]);
  useEffect(() => {
    audioRef.current.ontimeupdate = (e: any) => {
      if (song) {
        const time: number = e.target.currentTime;
        setFmtTime(timeFormat(time));
        setPercent(time / song.duration);
        // correct lyric every 10 seconds.
        if (lyricRef.current && /5$/.test(String(Math.ceil(time)))) {
          lyricRef.current.seek(time * 1000);
        }
      }
    };
    setTotalTime(timeFormat(song?.duration));
  }, [song]);
  useEffect(() => {
    audioRef.current.onplay = () => {
      playingRef.current = true;
      setPlaying(true);
    };
    audioRef.current.onpause = () => {
      playingRef.current = false;
      setPlaying(false);
      lyricRef.current?.stop();
    };
    audioRef.current.onended = () => {
      onNextClick();
    };
  }, [onNextClick]);
  useEffect(() => {
    if (song && song.url) {
      audioRef.current.src = song.url;
      audioRef.current.play().then(() => {
        // playing
      });
    }
  }, [song]);
  useEffect(() => {
    if (lyricRef.current) {
      lyricRef.current.stop();
      lyricRef.current = undefined;
    }
    if (lyric) {
      const lyrics = lyricRef.current = new Lyric(lyric, (line) => {
        setCurrentLine(line.lineNum);
        setCurrentLyric(line.txt);
        const lyricList = lyricListRef.current;
        if (lyricList) {
          const lines = lyricList.getElementsByClassName('text');
          const currentLine = lines[line.lineNum];
          if (currentLine) {
            scroll.scrollToElement(currentLine as HTMLElement, 1000, false, true);
          }
        }
      });
      setLyricLines(lyrics.lines);
      lyrics.play();
    }
  }, [lyric, scroll]);

  // Instance Ref
  const instance = useMemo<PlayerInstance>(() => {
    return {
      play() {
        return audioRef.current.play();
      },
      pause() {
        audioRef.current.pause();
      }
    };
  }, []);
  useImperativeHandle(ref, () => {
    return instance;
  }, [instance]);

  if (!song || !song.url) {
    return null;
  }
  return (
    <div className={combineClassNames('windy-player-wrapper', className)}>
      <CSSTransition
        in={fullScreen}
        timeout={400}
        classNames="normal"
        unmountOnExit
        key={'full'}
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onAfterEnter}
        onExit={onLeave}
        onExiting={onLeaving}
        onExited={onAfterLeave}
      >
        <div className="normal-player">
          <div className="background">
            <img width="100%" height="100%" src={song.image} alt={'bg'} />
          </div>
          <div className="top">
            <div className="back" onClick={toggleFullScreen}>
              <Icon type={'back'} className={'icon-back'} />
            </div>
            <h1 className="title">{song.name}</h1>
            <h2 className="subtitle">{song.singer}</h2>
          </div>
          <div
            className="middle"
            onTouchStart={middleTouchStart}
            onTouchMove={middleTouchMove}
            onTouchEnd={middleTouchEnd}
          >
            <div className="middle-l" ref={middleLRef}>
              <div className="cd-wrapper" ref={normalImgRef}>
                <div className={`cd play${playing ? '' : ' pause'}`}>
                  <img className="image" src={song.image} alt={'cd'}  />
                </div>
              </div>
              <div
                className="playing-lyric-wrapper"
                style={{
                  margin: `${(document.body.clientHeight - 80 - 170 - document.body.clientWidth * 0.8) / 2}px auto 0 auto`
                }}
              >
                <div className="playing-lyric" >{currentLyric}</div>
              </div>
            </div>
            <div className={'middle-r'} ref={lyricListRef}>
              <ScrollY scroll={scroll}>
                <div className="lyric-wrapper">
                  {
                    lyricLines.map((item, key) => (
                      <p className={`text${currentLine === key ? ' current' : ''}`} key={key}>{item.txt}</p>
                    ))
                  }
                </div>
              </ScrollY>
            </div>
          </div>
          <div className="bottom">
            <div className="dot-wrapper">
              <span className={combineClassNames('dot', currentShow === 'cd' ? ' active' : null)} />
              <span className={combineClassNames('dot', currentShow === 'lyric' ? ' active' : null)} />
            </div>
            <div className="progress-wrapper">
              <span className="time time-l">{fmtTime}</span>
              <div className="progress-bar-wrapper">
                <LineProgress percent={percent * 100} after={null} onChange={onProgressChange} />
              </div>
              <span className="time time-r">{totalTime}</span>
            </div>
            <div className="operators">
              <div
                className={combineClassNames('icon', 'i-left', isSwitching ? 'disabled' : null)}
                onClick={changeMode}
              >
                <Icon type={playMode} />
              </div>
              <div
                className={combineClassNames('icon', 'i-left', isSwitching ? 'disabled' : null)}
              >
                <Icon type={'previous'} onClick={onPreClick} />
              </div>
              <div className={combineClassNames('icon', 'i-center', isSwitching ? 'disabled' : null)}>
                <Icon type={playing ? 'pause-missing' : 'play-missing'} onClick={togglePlay} />
              </div>
              <div
                className={combineClassNames('icon', 'i-right', isSwitching ? 'disabled' : null)}
              >
                <Icon type={'next'} onClick={onNextClick} />
              </div>
              <div
                className={combineClassNames('icon', 'i-right', isSwitching ? 'disabled' : null)}
                onClick={onLikeClick}
              >
                <Icon style={{fontSize: 36}} className={like ? 'icon-favorite' : ''} type={like ? 'favorite' : 'not-favorite'} />
              </div>
            </div>
          </div>
        </div>
      </CSSTransition>
      <CSSTransition
        key={'mini'}
        in={!fullScreen}
        timeout={400}
        classNames="mini"
        unmountOnExit
      >
        <div className="mini-player">
          <div
            className="icon"
            onClick={() => setFullScreen(pre => !pre)}
          >
            <img
              width="40"
              height="40"
              src={song.image}
              className={combineClassNames('play', playing ? null : 'pause')}
              alt={'icon'}
              ref={miniImgRef}
            />
          </div>
          <div
            className="text"
            onClick={toggleFullScreen}
          >
            <h2 className="name">{song.name}</h2>
            <p className="desc">{song.singer}</p>
          </div>
          <div
            className="control"
            onClick={togglePlay}
          >
            <CircleProgress
              className={'windy-player-progress'}
              percent={percent * 100}
              middle={
                playing ? <Icon type={'pause'} className={'pause-icon'} /> : <Icon type={'play'} className={'play-icon'} />
              }
            />
          </div>
          <div
            className="control right-control"
          >
            <Icon type={'play-list'} className={'ctrl-icon'} />
          </div>
        </div>
      </CSSTransition>
    </div>
  );
};
export function getRandom(current: number, total: number): number {
  const random = Math.floor(Math.random() * total);
  if (random >= current) {
    return random - 1;
  }
  return random;
}

const Player = forwardRef(PlayerFc);
export { Player };
