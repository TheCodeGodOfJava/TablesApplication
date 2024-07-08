export interface AppAction<T> {
  type: ACTIONS;
  icon: string;
  getAction: (model: T, index: number) => void;
  getShowCondition: (model: T) => boolean;
  description: string;
}

export enum ACTIONS {
  EDIT = 'EDIT',
  SAVE = 'SAVE',
  CANCEL = 'CANCEL',
  REMOVE = 'REMOVE',
  UNBIND = 'UNBIND',
}
