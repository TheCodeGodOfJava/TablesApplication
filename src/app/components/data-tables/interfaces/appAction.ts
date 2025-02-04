import { AppEntity } from './appEntity';
import { ProtoAction } from './protoAction';

export interface AppAction<T> extends ProtoAction<T> {
  appEntity?: AppEntity<T>;
}
