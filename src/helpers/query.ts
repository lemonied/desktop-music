import { isDate, isNull, isPlainObject } from './utils';

function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']');
}
/*
  * format array item
  * for example:
  * transforms {arr: [1, {b: 1, c: [2, 3]}]} to arr[]=1&arr[1][b]=1&c[]=2&c[1]=3
  */
function arrayParser(arr: any[], prefix: string): string {
  return arr.map((item, key) => {
    const preKey = key === 0 ? '' : key;
    if (isNull(item)) { return `${prefix}[${preKey}]=`; }
    if (typeof item === 'string') {
      return `${prefix}[${preKey}]=${encode(item)}`;
    } else if (Array.isArray(item)) {
      return arrayParser(item, `${prefix}[${preKey}]`);
    } else if (isPlainObject(item)) {
      return queryString(item, `${prefix}[${preKey}]`);
    } else {
      return `${prefix}[${preKey}]=${JSON.stringify(item)}`;
    }
  }).join('&');
}

export function queryString(val: any, prefix?: string): string {
  if (isPlainObject(val)) {
    const serializedParams: string[] = [];
    Object.keys(val).forEach(key => {
      let value = val[key];
      if (isNull(value)) { return; }
      if (isDate(value)) {
        value = value.toISOString();
      } else if (Array.isArray(value)) {
        return serializedParams.push(arrayParser(value, key));
      } else if (isPlainObject(value)) {
        value = JSON.stringify(value);
      }
      const ret = prefix ?
        `${prefix}[${key}]=${encode(value)}` :
        `${key}=${encode(value)}`;
      serializedParams.push(ret);
    });
    return serializedParams.join('&');
  } else {
    return val || '';
  }
}

export function queryParse(val: any): any {
  if (typeof val === 'string') {
    if (val.indexOf('?') === 0) { val = val.substr(1); }
    const query: { [prop: string]: string } = {};
    val.split('&').forEach((item: { split: (arg0: string) => string[] }) => {
      const arr: string[] = item.split('=');
      query[arr[0]] = arr[1];
    });
    return query;
  } else if (isPlainObject(val)) {
    return val;
  } else {
    return {};
  }
}
