import { store } from './index';
import { originalReducers } from './reducers';
import { combineReducers } from 'redux-immutable';
import { Reducer, ReducersMapObject } from 'redux';
import { random_str } from '../helpers/random';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { useSelector } from 'react-redux';

export const makeAllReducers = (reducers: ReducersMapObject): Reducer => (combineReducers({ ...reducers }));
// Inject reducer dynamically.
export const injectReducer = (key: string, reducer: Reducer) => {
  if (Object.hasOwnProperty.call(originalReducers, key)) {
    /*
    * This reducer has been injected.
    */
    return;
  }
  Object.assign(originalReducers, { [key]: reducer });
  store.replaceReducer(
    makeAllReducers(originalReducers)
  );
};

type JinxRets<S, A> = {
  [key in keyof A]: (params?: any) => Observable<S>;
}
interface JinxActions<S, A> {
  [key: string]: (state: S, ctx: A, store: any, params?: any) => Observable<S>;
}
export const jinx = <S, A extends JinxActions<S, A>>(opts: { namespace: string, state: S, actions: A }) => {
  const name = random_str('jinx');
  const SET_ACTION = Symbol(`SET_${name}`);
  const states = (defaultState: S = opts.state, action: any) => {
    switch (action.type) {
      case SET_ACTION:
        return action.value;
      default:
        return defaultState;
    }
  };
  injectReducer(name, states);
  const rets: JinxRets<S, A> = {} as JinxRets<S, A>;
  Object.keys(opts.actions).forEach(key => {
    (opts.actions as any)[key] = (params?: any) => {
      return (opts.actions as any)[key].call(rets, store.getState().get(name), rets, store, params).pipe(
        map(state => {
          store.dispatch({ type: SET_ACTION, value: state });
          return store.getState().get(name);
        })
      );
    };
  });
  const use = (): S => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSelector((state: any) => state.get(name));
  };
  return { actions: rets, use };
};

jinx({
  namespace: 'jinx',
  state: {},
  actions: {
    set(state, ctx, store, params) {
      return of();
    }
  }
});
