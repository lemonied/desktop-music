import React, { FC, useEffect } from 'react';
import './store/reducers';
import { Structure } from '../../business/structure';
import { http } from '../../helpers/http';

interface Props {}

const Home: FC<Props> = () => {

  useEffect(() => {
    http({
      url: 'https://www.zghnrc.gov.cn/service/business/sms/sms/getContentList',
      method: 'POST',
      data: {
        plateform: 1,
        rowsNum: 20,
        countsNum: 50,
        channel_code: 'ZXDT'
      },
      headers: {
        'Referer': 'https://zghnrc.gov.cn',
        'Host': 'www.zghnrc.gov.cn',
        'Origin': 'https://zghnrc.gov.cn'
      }
    }).subscribe(res => {
      console.log(res);
    });
  }, []);

  return (
    <Structure>
      {
        new Array(50).fill(1).map((val, key) => (
          <div key={key}>Content</div>
        ))
      }
    </Structure>
  );
};

export default Home;
