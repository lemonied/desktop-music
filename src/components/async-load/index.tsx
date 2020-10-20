import React, { FC, useEffect, useState } from 'react';
import { progressBar } from '../progress';

interface Props {
  load: () => Promise<any>;
}

let cache: any = null;
const AsyncLoad: FC<Props> = function (props) {
  const { load } = props;
  const [ Child, setChild ] = useState<any>(cache);
  useEffect(() => {
    progressBar.open();
    setTimeout(() => progressBar.set(100));
    load().then(res => {
      setChild(res);
      cache = res;
      progressBar.destroy();
    });
    return () => {
      progressBar.destroy();
    };
  }, [load]);

  if (!Child) {
    return (
      <div style={{padding: 8}}>loading...</div>
    );
  }
  return (
    <Child.default />
  );
};

export { AsyncLoad };
