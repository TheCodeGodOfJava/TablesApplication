import { ACTIONS } from './ACTIONS';

export interface ProtoAction<T> {
  type: ACTIONS;
  icon: string;
  getAction?: (model: T, index: number) => void;
  getShowCondition: (model: T) => boolean;
  description: string;
}
