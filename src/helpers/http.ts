import { deepMerge } from './utils';
import { Observable } from 'rxjs';
import { USER_INFO_EXTRA } from '../store/types';

const { request } = (window as any).globalvars;

interface RequestConfig {
  method?: string;
  url?: string;
  params?: any;
  data?: any;
  timeout?: number;
  headers?: { [prop: string]: string; };
}

const defaultAxiosConf: RequestConfig = {
  timeout: 15000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept-Encoding': 'gzip',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
  },
  method: 'GET'
};

export function http(conf: RequestConfig | string): Observable<any> {
  return new Observable<any>(subscribe => {
    if (typeof conf === 'string') {
      conf = { url: conf };
    }
    const config = deepMerge(defaultAxiosConf, conf);
    const abort = request(config, (data: any) => {
      try {
        data = JSON.parse(data);
      } catch (e) {}
      subscribe.next(data);
      subscribe.complete();
    }, (error: any) => {
      console.error(error);
      subscribe.error(error);
      subscribe.complete();
    });
    return {
      unsubscribe() {
        abort();
      }
    };
  });
}

const qqHeaders = () => {
  return {
    'origin': 'https://y.qq.com',
    'referer': 'https://y.qq.com/',
    'cookie': getCookies()
  };
};
let cookies: string;
const getCookies = (): string => {
  if (cookies) {
    return cookies;
  }
  const extra = localStorage.getItem(USER_INFO_EXTRA);
  if (extra) {
    cookies = JSON.parse(extra).cookies.map((v: any) => `${v.name}=${v.value};`).join('');
    return cookies;
  }
  return '';
};
export function get(url: string, params?: any): Observable<any> {
  const headers = qqHeaders();
  return http({ method: 'GET', url, params, headers });
}
export function post(url: string, data?: any, headers?: any): Observable<any> {
  headers = Object.assign(qqHeaders(), headers || {});
  return http({ method: 'POST', url, data, headers });
}
