import { Action, createStore } from 'redux';
import { Map } from 'immutable';
import reducers from './reducers';

const developTool = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

const args: [any, any?] = developTool && process.env.NODE_ENV === 'development' ?
  [reducers, developTool()] :
  [reducers];

export const store = createStore<Map<string, any>, Action, any, any>(...args);
