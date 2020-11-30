import { fromJS, List, Record } from 'immutable';
import { Boom, Jinx, Spells } from '../../store/core';
import { USER_INFO_EXTRA } from '../../store/user-info';
import { get } from '../../helpers/http';
import { map } from 'rxjs/operators';
import defaultCD from '../../common/images/default-cd.png';
import { Observable, of, throwError } from 'rxjs';

export interface CDItem {
  dissid: string;
  picurl: string;
  dirid: string;
  title: string;
  subtitle: string;
}
type CDState = List<Record<CDItem>>;

const defaultState: CDState = fromJS([]);

@Jinx('cd', defaultState)
class CD extends Spells<CDState> {
  @Boom
  getCD(): Observable<CDState> {
    const userInfoExtra = localStorage.getItem(USER_INFO_EXTRA);
    if (userInfoExtra) {
      const parsed = JSON.parse(userInfoExtra);
      return get(parsed.diss.href).pipe(
        map(res => {
          if (res.code === 0) {
            return res.data.mydiss.list.map((item: any) => {
              return {
                dissid: item.dissid,
                picurl: item.picurl || defaultCD,
                dirid: item.dirid,
                title: item.title,
                subtitle: item.subtitle?.trim()
              };
            });
          }
          return of([]);
        }),
        map(list => {
          return fromJS(list);
        })
      );
    }
    return throwError(new Error('Cant get USER_INFO_EXTRA'));
  }
}

export const cd = new CD();

@Jinx('cdLoading', false)
class CDLoading extends Spells<boolean> {}

export const cdLoading = new CDLoading();
