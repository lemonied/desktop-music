import React, { FC, useEffect, useCallback, useRef, useMemo } from 'react';
import './style.scss';
import {
  PlayModes,
  useCurrentLyric,
  useCurrentSong,
  useCurrentSongLoading,
  useCurrentSongPlaying,
  useDuration,
  useNow,
  usePlayMode, useVolume
} from './store/reducers';
import { Observable, of, throwError, zip } from 'rxjs';
import { get, post } from '../../helpers/http';
import { catchError, concatMap, finalize } from 'rxjs/operators';
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
import { FastBackwardOutlined, FastForwardOutlined, CaretRightOutlined, PauseOutlined, SoundOutlined } from '@ant-design/icons';
import { EventManager } from '../../helpers/event';
import { Icon } from '../icon';
import { VOLUME_SIZE } from './store/types';
import { useGetFavorite, useSetFavoriteLoading } from '../../views/favorite/store/actions';
import { useFavorites } from '../../views/favorite/store/reducers';

const playerEvent = new EventManager();

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

  const middleRef = useRef<any>();
  const rightRef = useRef<any>();
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
  const volume = useVolume();
  const setVolume = useSetVolume();
  const playMode = usePlayMode();
  const setPlayMode = useSetPlayMode();
  const timerRef = useRef<any>();
  const getFavorites = useGetFavorite();
  const favorites = useFavorites();
  const setFavoriteLoading = useSetFavoriteLoading();

  const getPlayInfo = useCallback<() => Observable<[string, string]>>(() => {
    if (currentSong) {
      clearTimeout(timerRef.current);
      const mid = currentSong.get('songmid');
      const url = currentSong.get('url');
      let playUrl: Observable<string>;
      if (!mid && url) {
        playUrl = of(url);
      } else {
        const data = JSON.stringify(
          {
            'req_0': {
              'module': 'vkey.GetVkeyServer',
              'method': 'CgiGetVkey',
              'param': {
                'guid': '7500658880',
                'songmid': [mid],
                'songtype': [],
                'uin': '0',
                'loginflag': 0,
                'platform': '23',
                'h5to': 'speed'
              }
            }, 'comm': {'uin': 0, 'format': 'json', 'ct': 23, 'cv': 0}
          }
        );
        playUrl = post(`https://u.y.qq.com/cgi-bin/musicu.fcg?_=${Date.now()}`, data, {
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
        );
      }

      return zip(
        playUrl,
        get(`https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric.fcg?uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&nobase64=1&musicid=${currentSong.get('songid')}&songtype=0&_=${Date.now()}`).pipe(
          concatMap(res => {
            // eslint-disable-next-line no-eval
            const lyric = eval(`function MusicJsonCallback(r) {return r}${res}`);
            if (lyric.code === 0) {
              const lrc = unescapeHTML(lyric.lyric);
              return of(lrc);
            }
            return of('No Lyric');
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
  const onError = useCallback((e) => {
    console.error(e);
    setPlaying(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (lastOperationRef.current === 'previous') {
        previous();
      } else {
        next();
      }
    }, 500);
  }, [previous, next, setPlaying]);
  const onVolumeChange = useCallback((volume: number) => {
    audioService.volume = Math.min(Math.max(volume / 100, 0), 1);
  }, []);
  const isFavorite = useMemo(() => {
    return favorites.findIndex(v => v.songid === currentSong?.get('songid')) > -1;
  }, [currentSong, favorites]);

  useEffect(() => {
    audioService.onplay = () => {
      setPlaying(true);
    };
    audioService.onpause = () => {
      setPlaying(false);
      lyricRef.current?.stop();
    };
    audioService.onvolumechange = (e: any) => {
      localStorage.setItem(VOLUME_SIZE, e.target.volume);
      setVolume(e.target.volume);
    };
    audioService.onerror = (e) => {
      onError(e);
    };
  }, [onError, setPlaying, setVolume]);
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
      setTimeout(() => {
        playerEvent.emit('error', err);
      }, 20);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [getPlayInfo, setLoading, setCurrentLyric, setCurrentLyricNum, setLyric]);
  useEffect(() => {
    const subscription = playerEvent.observe('error').subscribe(err => {
      onError(err);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [onError]);

  useEffect(() => {
    setFavoriteLoading(true);
    getFavorites().pipe(
      finalize(() => setFavoriteLoading(false)),
      catchError(err => {
        console.error(err);
        return of();
      })
    ).subscribe();
  }, [getFavorites, setFavoriteLoading]);

  if (!currentSong) {
    return null;
  }
  return (
    <div className={combineClassNames('mini-player', className)}>
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
        <div className={'mode'}>
          <Icon type={playMode} className={'control-icon mode-icon'} onClick={changePlayMode} />
        </div>
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
      <div className={'middle'} ref={middleRef}>
        <div className={'lyric-snapshot'} title={currentLyric}>{currentLyric}</div>
        <div className={'progress-wrapper'}>
          <div className={'now'}>{audioTimeFormat(now)}</div>
          <LineProgress
            percent={duration ? now / duration * 100 : 0}
            className={'progress'}
            wrapper={middleRef}
            onChange={onProgressChange}
          />
          <div className={'duration'}>{audioTimeFormat(duration)}</div>
        </div>
      </div>
      <div className={'right'} ref={rightRef}>
        <Icon
          type={isFavorite ? 'favorite' : 'not-favorite'}
          className={isFavorite ? 'favorite' : 'not-favorite'}
        />
        <div className={'volume'}>
          <SoundOutlined className={'volume-icon'} />
          <LineProgress
            percent={volume * 100}
            className={'volume-progress'}
            wrapper={rightRef}
            onChange={onVolumeChange}
            dot={
              <div className={'volume-dot'} />
            }
            realTime
          />
          <div className={'volume-num'}>{Math.floor(volume * 100)}</div>
        </div>
      </div>
    </div>
  );
};

export { Player };
