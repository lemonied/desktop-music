import { deepMerge } from './utils';
import { Observable } from 'rxjs';

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
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
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
export function get(url: string, params?: any): Observable<any> {
  return http({ method: 'GET', url, params });
}
export function post(url: string, data?: any, headers?: any): Observable<any> {
  return http({ method: 'POST', url, data, headers: headers || {} });
}
