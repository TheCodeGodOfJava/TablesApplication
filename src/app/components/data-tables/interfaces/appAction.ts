import { AppEntity } from './appEntity';

export interface AppAction<T> {
  type: ACTIONS;
  icon: string;
  getAction?: (model: T, index: number) => void;
  getShowCondition: (model: T) => boolean;
  description: string;
  appEntity?: AppEntity<T>;
}

export enum ACTIONS {
  EDIT = 'EDIT',
  SAVE = 'SAVE',
  CANCEL = 'CANCEL',
  REMOVE = 'REMOVE',
  UNBIND = 'UNBIND',
  BIND = 'BIND',
  STATE = 'STATE',
  COLOR = 'COLOR',
  LABEL = 'LABEL',
}
