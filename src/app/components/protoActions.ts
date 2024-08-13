import { AppAction } from './data-tables/interfaces/appAction';

export abstract class ProtoActions<T> {
  allActions!: AppAction<T>[];
}
