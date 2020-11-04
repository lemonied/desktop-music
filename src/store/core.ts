import { store } from './index';
import { originalReducers } from './reducers';
import { combineReducers } from 'redux-immutable';
import { Reducer, ReducersMapObject } from 'redux';

export const makeAllReducers = (reducers: ReducersMapObject): Reducer => (combineReducers({ ...reducers }));

// Inject reducer dynamically.
export const injectReducer = (key: string | symbol, reducer: Reducer) => {
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
