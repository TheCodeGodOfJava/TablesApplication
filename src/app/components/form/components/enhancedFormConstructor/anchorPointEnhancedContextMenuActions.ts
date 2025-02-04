import { ACTIONS } from '../../../data-tables/interfaces/ACTIONS';
import { AnchorPointAction } from '../../../data-tables/interfaces/anchorPointAction';
import { ProtoActions } from '../../../protoActions';

export class AnchorPointEnhancedContextMenuActions extends ProtoActions {
  public rowIndex: number = 0;
  public colIndex: number = 0;

  override allActions: AnchorPointAction[] = [
    {
      type: ACTIONS.CREATE,
      icon: 'add',
      getAction: () => true,
      description: 'Add a new tile',
    },
  ];

  constructor() {
    super();
  }
}
