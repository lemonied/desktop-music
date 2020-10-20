import { queryParse, queryString } from './query';

interface Url {
  path: string;
  query: string;
  hash: string;
  origin: string;
}

export function urlParser(href: string): Url {
  const l = href.split('#');
  const hash = l[1] ? `#${l[1]}` : '';
  const wholePath: string[] = l[0].split('?');
  const path = wholePath[0];
  const query = wholePath[1] ? `?${wholePath[1]}` : '';
  return {
    path,
    query,
    hash,
    origin: getOrigin(path)
  };
}

function getOrigin(url: string): string {
  if (!isWholeUrl(url)) { return ''; }
  return url.replace(/([^/])\/[^/].*/, '$1');
}

export function buildUrl(url: string, params?: any, paramsSerializer?: (params: any) => string): string {
  const parsedUrl = urlParser(url);
  const { query: search, path } = parsedUrl;
  let stringedQuery: string;
  if (isURLSearchParams(params)) {
    stringedQuery = params.toString();
  } else if (typeof paramsSerializer === 'function') {
    stringedQuery = paramsSerializer(params);
  } else {
    const query = Object.assign(queryParse(search), queryParse(params));
    stringedQuery = queryString(query);
  }
  return `${path}${stringedQuery ? '?' + stringedQuery : ''}`;
}

export function isWholeUrl(url: string): boolean {
  return /^http(s?):\/\//.test(url);
}

export function isAbsoluteUrl(url: string): boolean {
  return /^\//.test(url);
}

export function compileUrl(baseUrl: string, url: string): string {
  if (isWholeUrl(url) || !baseUrl) { return url; }
  return baseUrl.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
}

export function resolveUrl(from: string, to: string): string {
  if (!from) { return to; }
  if (!to) { return ''; }
  if (isWholeUrl(to)) { return to; }
  const baseUrl = urlParser(from);
  if (isAbsoluteUrl(to)) {
    return baseUrl.origin + to;
  } else {
    return baseUrl.path.replace(/(\/)[^/.]*$/, '$1') + to;
  }
}

export function isURLSearchParams(val: any): val is URLSearchParams {
  return typeof val !== 'undefined' && val instanceof URLSearchParams;
}

export function isUrlSameOrigin(requestUrl: string): boolean {
  if (!isWholeUrl(requestUrl)) { return true; }
  const parsedUrl = urlParser(requestUrl);
  const current = urlParser(window.location.href);
  return parsedUrl.origin === current.origin;
}
