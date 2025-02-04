import { ACTIONS } from '../../../data-tables/interfaces/ACTIONS';
import { AnchorPointAction } from '../../../data-tables/interfaces/anchorPointAction';
import { ProtoActions } from '../../../protoActions';

export class AnchorPointEnhancedContextMenuActions extends ProtoActions {
  override allActions: AnchorPointAction[] = [
    {
      type: ACTIONS.CREATE,
      icon: 'add',
      getAction: () => true,
      description: 'Add new tile',
    },
  ];

  constructor() {
    super();
  }
}
