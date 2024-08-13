import { Id } from '../../models/id';
import { ACTIONS } from '../data-tables/interfaces/appAction';
import { AppEntity } from '../data-tables/interfaces/appEntity';
import { ProtoActions } from '../protoActions';

export class FormContextMenuActions<T extends Id> extends ProtoActions<
  AppEntity<T>
> {
  override allActions = [
    {
      type: ACTIONS.DISABLE,
      icon: 'create',
      getAction: (model: AppEntity<T>, index: number) => {},
      getShowCondition: (model: AppEntity<T>) => true,
      description: 'Edit',
    },
  ];

  constructor() {
    super();
  }
}
