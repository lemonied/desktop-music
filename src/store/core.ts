import { store } from './index';
import { originalReducers } from './reducers';
import { combineReducers } from 'redux-immutable';
import { Reducer, ReducersMapObject } from 'redux';
import { random_str } from '../helpers/random';
import { Observable } from 'rxjs';
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

const stateKey = Symbol('name');
const actionKey = Symbol('action');
export const Boom = (target: any, name: string, descriptor: PropertyDescriptor) => {
  const value = target[name];
  if (typeof value !== 'function') {
    throw new Error(`${name} must be a function`);
  }
  descriptor.value = function (...args: any[]) {
    const observable = value.apply(this, args);
    if (!(observable instanceof Observable)) {
      throw new Error(`${name} must return an Observable`);
    }
    return observable.pipe(
      map(state => {
        store.dispatch({ type: target[actionKey], value: state });
        return state;
      })
    );
  };
  return descriptor;
};
export const Jinx = <S>(namespace: string, defaultStates: S) => {
  return (target: any) => {
    const name = random_str(namespace);
    const SET_ACTION = Symbol(`SET_${name}`);
    target.prototype[stateKey] = name;
    target.prototype[actionKey] = SET_ACTION;
    const states = (defaultState = defaultStates, action: any) => {
      switch (action.type) {
        case SET_ACTION:
          return action.value;
        default:
          return defaultState;
      }
    };
    injectReducer(name, states);
  };
};
export class Spells<S> {
  store = store;
  getState(): S {
    return this.store.getState().get((this as any)[stateKey]);
  }
  use(): S {
    return useSelector((state: any) => state.get((this as any)[stateKey]));
  }
  set(value: S) {
    this.store.dispatch({ type: (this as any)[actionKey], value });
  }
}
