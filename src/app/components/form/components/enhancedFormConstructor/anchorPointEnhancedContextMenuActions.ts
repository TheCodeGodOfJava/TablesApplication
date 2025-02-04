import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Id } from '../../../../models/id';
import { ACTIONS } from '../../../data-tables/interfaces/ACTIONS';
import { AnchorPointAction } from '../../../data-tables/interfaces/anchorPointAction';
import { AppEntity } from '../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../data-tables/interfaces/inputTypes';
import { ProtoActions } from '../../../protoActions';
import { TileEnhancedOperations } from './abstract/tile-enhanced-operations';

export class AnchorPointEnhancedContextMenuActions<
  T extends Id
> extends ProtoActions {
  public rowIndex: number = 0;
  public colIndex: number = 0;

  tileColSpanAlias: string = 'tile-col-span';
  tileRowSpanAlias: string = 'tile-row-span';

  anchorPointFormGroup!: FormGroup;

  anchorPointFields!: AppEntity<T>[];

  override allActions: AnchorPointAction[] = [
    {
      type: ACTIONS.CREATE,
      icon: 'add',
      getAction: () => {
        console.log('Current row index = ', this.rowIndex);
        console.log('Current col index = ', this.colIndex);
        console.log(
          'Current row span = ',
          this.anchorPointFormGroup.get(this.tileRowSpanAlias)?.value
        );
        console.log(
          'Current col span = ',
          this.anchorPointFormGroup.get(this.tileColSpanAlias)?.value
        );
      },
      description: 'Add a new tile',
    },
  ];

  constructor(
    protected fb: FormBuilder,
    protected tileOps: TileEnhancedOperations<T>
  ) {
    super();

    this.anchorPointFields = [
      {
        alias: this.tileColSpanAlias,
        placeholder: 'Col span',
        mainControl: {
          type: CONTROL_TYPE.INPUT,
          getControl: () => new FormControl<number>(2),
        },
      },
      {
        alias: this.tileRowSpanAlias,
        placeholder: 'Row span',
        mainControl: {
          type: CONTROL_TYPE.INPUT,
          getControl: () => new FormControl<number>(1),
        },
      },
    ];

    this.anchorPointFormGroup = this.fb.group({});
    this.anchorPointFields.forEach((c) =>
      this.tileOps.addControlsToFormGroup(
        c.alias,
        c.mainControl,
        this.anchorPointFormGroup
      )
    );
  }
}
