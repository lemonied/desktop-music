export function isDate(val: any): val is Date {
  return toString.call(val) === '[object Date]';
}

export function isPlainObject(val: any): val is { [prop: string]: any } {
  return toString.call(val) === '[object Object]';
}

// null or undefined
export function isNull(val: any): val is null | undefined {
  return val === undefined || val === null;
}

// null | undefined | {}
export function isEmpty(val: any): boolean {
  if (typeof val === 'undefined') {
    return true;
  } else if (typeof val === 'object' && (val === null || Object.keys(val).length === 0)) {
    return true;
  }
  return false;
}

// return a new object.
export function deepMerge(...args: any[]): any {
  if (args.length < 1) {
    return null;
  }
  if (args.some(item => !isPlainObject(item) && !Array.isArray(item))) {
    throw new Error('Arguments must be all object or array');
  }
  const ret = Array.isArray(args[0]) ? [] : Object.create(null);
  function deep(val: any, key: any) {
    if (isPlainObject(val)) {
      if (isPlainObject(ret[key])) {
        ret[key] = deepMerge(ret[key], val);
      } else {
        ret[key] = deepMerge(val);
      }
    } else if (Array.isArray(val)) {
      if (Array.isArray(ret[key])) {
        ret[key] = deepMerge(ret[key], val);
      } else {
        ret[key] = deepMerge(val);
      }
    } else {
      ret[key] = val;
    }
  }
  args.forEach(obj => {
    if (isPlainObject(obj)) {
      Object.keys(obj).forEach(key => {
        const val = obj[key];
        deep(val, key);
      });
    } else if (Array.isArray(obj)) {
      obj.forEach((item, key) => {
        deep(item, key);
      });
    }
  });
  return ret;
}

export function lightCompare(o1: any, o2: any): boolean {
  if (isPlainObject(o1) && isPlainObject(o2)) {
    return Object.keys(o2).every(key => o2[key] === o1[key]);
  }
  return o1 === o2;
}

export function debounce(func: (args?: any) => any, delay = 300) {
  let timer: any;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export function combineClassNames(...args: (string | null | undefined)[]) {
  const classNames: string[] = [];
  args.forEach(item => {
    if (typeof item !== 'string') {
      return;
    }
    item = item.trim();
    if (!item) {
      return;
    }
    item.split(' ').forEach(className => {
      if (classNames.indexOf(className) === -1) {
        classNames.push(className);
      }
    });
  });
  return classNames.join(' ');
}

export function addClass(dom: HTMLElement, className: string) {
  dom.className = combineClassNames(dom.className, className);
}

const elementStyle = document.createElement('div').style;

const vendor = (style: string) => {
  const upStyle = style.charAt(0).toUpperCase() + style.substr(1);
  const transformNames: any = {
    standard: style,
    webkit: `webkit${upStyle}`,
    Moz: `Moz${upStyle}`,
    O: `O${upStyle}`,
    ms: `ms${upStyle}`
  };

  for (const key in transformNames) {
    if (transformNames.hasOwnProperty(key) && typeof elementStyle[transformNames[key]] !== 'undefined') {
      return key;
    }
  }

  return false;
};

export function prefixStyle(style: string): string {
  const prefix = vendor(style);

  if (prefix === 'standard' || prefix === false) {
    return style;
  }

  return prefix + style.charAt(0).toUpperCase() + style.substr(1);
}
