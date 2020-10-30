import { CD, CD_LOADING, SET_CD, SET_CD_LOADING } from './types';
import { injectReducer } from '../../../store/core';
import { useSelector } from 'react-redux';
import { Record, fromJS, List } from 'immutable';

export interface CDItem {
  dissid: string;
  picurl: string;
  dirid: string;
  title: string;
  subtitle: string;
}
export type CDState = List<Record<CDItem>>;

const defaultState: CDState = fromJS([]);

interface Action {
  type: symbol;
  value?: CDItem[];
}

const cdState = (state = defaultState, action: Action) => {
  switch (action.type) {
    case SET_CD:
      return fromJS(action.value);
    default:
      return state;
  }
};
const cdLoadingState = (state = true, action: any) => {
  switch (action.type) {
    case SET_CD_LOADING:
      return !!action.value;
    default:
      return state;
  }
};

export const useCD = (): CDState => {
  return useSelector((state: any) => state.get(CD));
};
export const useCDLoading = (): boolean => {
  return useSelector((state: any) => state.get(CD_LOADING));
};

injectReducer(CD, cdState);
injectReducer(CD_LOADING, cdLoadingState);
