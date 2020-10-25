import React, { FC, useEffect, useCallback, useRef } from 'react';
import './style.scss';
import {
  useCurrentLyric,
  useCurrentSong,
  useCurrentSongPlaying,
  useDuration,
  useNow,
  usePlayingList
} from './store/reducers';
import { Observable, of, throwError, zip } from 'rxjs';
import { get, post } from '../../helpers/http';
import { concatMap, finalize } from 'rxjs/operators';
import {
  useSetVolume,
  useSetCurrentLyric,
  useSetCurrentLyricNum,
  useSetCurrentSong,
  useSetCurrentSongLoading,
  useSetCurrentSongPlaying,
  useSetLyric,
  useSetNow
} from './store/actions';
import { Lyric } from './lyric';
import { audioService } from './player';
import { combineClassNames } from '../../helpers/utils';
import { CircleProgress } from '../progress';
import { Icon } from '../icon';
import { FastBackwardOutlined, FastForwardOutlined } from '@ant-design/icons';

const useNextSong = () => {
  const setCurrentSong = useSetCurrentSong();
  const playingList = usePlayingList();
  const currentSong = useCurrentSong();
  return useCallback(() => {
    const index = playingList.findIndex(v => v === currentSong);
    setCurrentSong(
      playingList.get((index + 1) % playingList.size)
    );
  }, [playingList, setCurrentSong, currentSong]);
};
const usePreviousSong = () => {
  const setCurrentSong = useSetCurrentSong();
  const playingList = usePlayingList();
  const currentSong = useCurrentSong();
  return useCallback(() => {
    let index = playingList.findIndex(v => v === currentSong) - 1;
    if (index < 0) {
      index = playingList.size - 1;
    }
    setCurrentSong(
      playingList.get(index)
    );
  }, [playingList, setCurrentSong, currentSong]);
};

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

  const currentSong = useCurrentSong();
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
  const previous = usePreviousSong();
  const next = useNextSong();
  const setVolume = useSetVolume();

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
            return throwError(new Error('Fail to get lyric'));
          })
        )
      );
    }
    return throwError(new Error('No CurrentSong'));
  }, [currentSong]);

  const togglePlay = useCallback(() => {
    if (playing) {
      audioService.pause();
    } else {
      audioService.play();
    }
  }, [playing]);

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
  }, [setPlaying, setVolume]);
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
      audioService.volume = 0.5;
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
    <div className={combineClassNames('mini-player', className)}>
      <div className={'previous-song'} onClick={previous}>
        <FastBackwardOutlined />
      </div>
      <div
        className={'mini-player-progress'}
        onClick={togglePlay}
      >
        <CircleProgress
          className={''}
          percent={now / duration * 100}
          middle={
            playing ? <Icon type={'pause'} className={'pause-icon'} /> : <Icon type={'play'} className={'play-icon'} />
          }
        />
      </div>
      <div className={'next-song'} onClick={next}>
        <FastForwardOutlined />
      </div>
      <div>{currentLyric}</div>
    </div>
  );
};

export { Player };
