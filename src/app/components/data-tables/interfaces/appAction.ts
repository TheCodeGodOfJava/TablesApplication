import { AppEntity } from './appEntity';
import { ProtoAction } from './protoAction';

export interface AppAction<T> extends ProtoAction {
  getAction?: (model: T, index: number) => void;
  getShowCondition: (model: T) => boolean;
  appEntity?: AppEntity<T>;
}
