import React, { FC, useEffect, useCallback, useRef } from 'react';
import './style.scss';
import {
  PlayModes,
  useCurrentLyric,
  useCurrentSong,
  useCurrentSongLoading,
  useCurrentSongPlaying,
  useDuration,
  useNow,
  usePlayMode
} from './store/reducers';
import { Observable, of, throwError, zip } from 'rxjs';
import { get, post } from '../../helpers/http';
import { concatMap, finalize } from 'rxjs/operators';
import {
  useSetVolume,
  useSetCurrentLyric,
  useSetCurrentLyricNum,
  useSetCurrentSongLoading,
  useSetCurrentSongPlaying,
  useSetLyric,
  useSetNow,
  usePreviousSong,
  useNextSong, useSetPlayMode
} from './store/actions';
import { Lyric } from './lyric';
import { audioService, audioTimeFormat } from './player';
import { combineClassNames } from '../../helpers/utils';
import { LineProgress } from '../progress';
import { FastBackwardOutlined, FastForwardOutlined, CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import { Icon } from '../icon';

const unescapeHTML = function(lrc: string){
  const t = document.createElement('div');
  t.innerHTML = lrc + '';
  return t.innerText;
};

interface PlayerProps {
  className?: string;
}
const Player: FC<PlayerProps> = function(props) {
  const { className } = props;

  const miniPlayerRef = useRef<any>();
  const lastOperationRef = useRef<'previous' | 'next'>();
  const currentSong = useCurrentSong();
  const loading = useCurrentSongLoading();
  const setLoading = useSetCurrentSongLoading();
  const setPlaying = useSetCurrentSongPlaying();
  const lyricRef = useRef<Lyric>();
  const setLyric = useSetLyric();
  const setCurrentLyric = useSetCurrentLyric();
  const setCurrentLyricNum = useSetCurrentLyricNum();
  const currentLyric = useCurrentLyric();
  const setNow = useSetNow();
  const playing = useCurrentSongPlaying();
  const now = useNow();
  const duration = useDuration();
  const previousSong = usePreviousSong();
  const nextSong = useNextSong();
  const setVolume = useSetVolume();
  const playMode = usePlayMode();
  const setPlayMode = useSetPlayMode();

  const getPlayInfo = useCallback<() => Observable<[string, string]>>(() => {
    if (currentSong) {
      const data = JSON.stringify(
        {
          'req_0': {
            'module': 'vkey.GetVkeyServer',
            'method': 'CgiGetVkey',
            'param': {
              'guid': '7500658880',
              'songmid': [currentSong.get('songmid')],
              'songtype': [],
              'uin': '0',
              'loginflag': 0,
              'platform': '23',
              'h5to': 'speed'
            }
          }, 'comm': {'uin': 0, 'format': 'json', 'ct': 23, 'cv': 0}
        }
      );
      return zip(
        post(`https://u.y.qq.com/cgi-bin/musicu.fcg?_=${Date.now()}`, data, {
          'Content-Type': 'application/json; charset=UTF-8',
          'referer': 'https://u.y.qq.com',
          'origin': 'https://u.y.qq.com'
        }).pipe(
          concatMap(res => {
            if (res.code === 0) {
              let url = res.req_0.data;
              return of(`${url.sip[0]}${url.midurlinfo[0].purl}`);
            }
            return throwError(new Error('Fail to get play url'));
          })
        ),
        get(`https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric.fcg?uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&nobase64=1&musicid=${currentSong.get('songid')}&songtype=0&_=${Date.now()}`).pipe(
          concatMap(res => {
            // eslint-disable-next-line no-eval
            const lyric = eval(`function MusicJsonCallback(r) {return r}${res}`);
            if (lyric.code === 0) {
              const lrc = unescapeHTML(lyric.lyric);
              return of(lrc);
            }
            return of('');
          })
        )
      );
    }
    return throwError(new Error('No CurrentSong'));
  }, [currentSong]);

  const previous = useCallback(() => {
    previousSong();
    lastOperationRef.current = 'previous';
  }, [previousSong]);
  const next = useCallback(() => {
    nextSong();
    lastOperationRef.current = 'next';
  }, [nextSong]);
  const togglePlay = useCallback(() => {
    if (playing) {
      audioService.pause();
    } else {
      audioService.play();
    }
  }, [playing]);
  const onProgressChange = useCallback((percent: number) => {
    audioService.currentTime = percent / 100 * duration;
    lyricRef.current?.seek(audioService.currentTime * 1000);
  }, [duration]);
  const changePlayMode = useCallback(() => {
    const playModes: PlayModes[] = ['sequence', 'loop', 'random'];
    setPlayMode(
      playModes[(playModes.indexOf(playMode) + 1) % playModes.length]
    );
  }, [playMode, setPlayMode]);

  useEffect(() => {
    audioService.onplay = () => {
      setPlaying(true);
    };
    audioService.onpause = () => {
      setPlaying(false);
      lyricRef.current?.stop();
    };
    audioService.onvolumechange = (e: any) => {
      setVolume(e.target.volume);
    };
    audioService.onerror = (e) => {
      console.error(e);
      setPlaying(false);
      if (lastOperationRef.current === 'previous') {
        previous();
      } else {
        next();
      }
    };
  }, [setPlaying, setVolume, next, previous]);
  useEffect(() => {
    audioService.ontimeupdate = (e: any) => {
      if (currentSong) {
        const time: number = e.target.currentTime;
        setNow(time);
        // correct lyric every 10 seconds.
        if (lyricRef.current && /5$/.test(String(Math.ceil(time)))) {
          lyricRef.current.seek(time * 1000);
        }
      }
    };
  }, [currentSong, setNow]);
  useEffect(() => {
    audioService.onended = () => {
      if (playMode === 'loop') {
        audioService.play();
      } else {
        next();
      }
    };
  }, [next, playMode]);
  useEffect(() => {
    setLoading(true);
    const subscription = getPlayInfo().pipe(
      finalize(() => setLoading(false))
    ).subscribe(res => {
      const [url, lyric] = res;
      lyricRef.current?.stop();
      lyricRef.current = new Lyric(lyric, v => {
        setCurrentLyricNum(v.lineNum);
        setCurrentLyric(v.txt);
      });
      setLyric(lyricRef.current.lines);
      audioService.src = url;
      audioService.play().then(() => {
        lyricRef.current?.play();
      });
    }, err => {
      console.error(err);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [getPlayInfo, setLoading, setCurrentLyric, setCurrentLyricNum, setLyric]);

  if (!currentSong) {
    return null;
  }
  return (
    <div className={combineClassNames('mini-player', className)} ref={miniPlayerRef}>
      <div className={'play-info'}>
        <div className={combineClassNames('img', 'play', playing ? null : 'pause')}>
          <img src={currentSong.get('image')} alt={currentSong.get('name')}/>
        </div>
        <div className={'info'}>
          <div className={'name'} title={currentSong.get('name')}>{ currentSong.get('name') }</div>
          <div className={'desc'} title={currentSong.get('singer')}>{ currentSong.get('singer') }</div>
        </div>
      </div>
      <div className={'control'}>
        <div className={'previous-song'} onClick={previous}>
          <FastBackwardOutlined className={combineClassNames('control-icon', loading ? 'loading' : null)} />
        </div>
        <div
          className={'toggle-play'}
          onClick={togglePlay}
        >
          {
            playing ?
              <PauseOutlined className={'control-icon'} /> :
              <CaretRightOutlined className={'control-icon'} />
          }
        </div>
        <div className={'next-song'} onClick={next}>
          <FastForwardOutlined className={combineClassNames('control-icon', loading ? 'loading' : null)} />
        </div>
      </div>
      <div className={'middle'}>
        <div className={'lyric-snapshot'} title={currentLyric}>{currentLyric}</div>
        <div className={'progress-wrapper'}>
          <div className={'now'}>{audioTimeFormat(now)}</div>
          <LineProgress
            percent={now / duration * 100}
            className={'progress'}
            wrapper={miniPlayerRef}
            onChange={onProgressChange}
          />
          <div className={'duration'}>{audioTimeFormat(duration)}</div>
        </div>
      </div>
      <div className={'right'}>
        <Icon type={playMode} className={'right-icon'} onClick={changePlayMode} />
      </div>
    </div>
  );
};

export { Player };
