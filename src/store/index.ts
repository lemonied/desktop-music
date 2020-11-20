import { createStore } from 'redux';
import reducers from './reducers';

const developTool = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

const args: [any, any?] = developTool && process.env.NODE_ENV === 'development' ?
  [reducers, developTool()] :
  [reducers];

export const store = createStore<any, any, any, any>(...args);
