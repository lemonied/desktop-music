import { fromJS, Record } from 'immutable';
import { Boom, Jinx, Spells } from './core';
import { get } from '../helpers/http';
import { of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

const { login } = (window as any).globalvars;
export const USER_INFO_EXTRA = 'USER_INFO_EXTRA';

interface UserInfoState {
  status: 0 | 1 | -1;
  qq?: string;
  nick?: string;
  avatar?: string;
}
type StateTypes = Record<UserInfoState>;

const defaultState = fromJS({
  status: -1
});

@Jinx('userInfo', defaultState)
class UserInfo extends Spells<StateTypes> {
  @Boom
  pullUserInfo() {
    const extra = localStorage.getItem(USER_INFO_EXTRA);
    if (extra) {
      const { loginParams } = JSON.parse(extra);
      return get(loginParams.href).pipe(
        concatMap(res => {
          if (res?.code === 0 && res.base?.code === 0 && res.base.data?.code === 0) {
            const maps = res.base.data.map_userinfo;
            if (maps) {
              const info = maps[Object.keys(maps)[0]];
              if (info) {
                return of(fromJS({ status: 1, qq: info.uin, nick: info.nick, avatar: info.headurl }));
              }
            }
          }
          localStorage.removeItem(USER_INFO_EXTRA);
          return of(fromJS({ status: 0 }));
        })
      );
    } else {
      return of(fromJS({ status: 0 }));
    }
  }
  login() {
    login().then((res: any) => {
      localStorage.setItem(USER_INFO_EXTRA, JSON.stringify(res));
      this.pullUserInfo().subscribe();
    });
  }
  logout() {
    localStorage.removeItem(USER_INFO_EXTRA);
    this.pullUserInfo().subscribe();
  }
}

export const userInfo = new UserInfo();
