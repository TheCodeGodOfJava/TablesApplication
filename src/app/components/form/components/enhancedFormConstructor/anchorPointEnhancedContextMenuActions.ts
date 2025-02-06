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
      icon: 'add_circle_outline',
      getShowCondition: () =>
        !this.tileOps.drawMatrix.drawMatrix[this.rowIndex][this.colIndex],
      getAction: () => {
        const tileRowSpan: number = this.anchorPointFormGroup.get(
          this.tileRowSpanAlias
        )?.value;
        const tileColSpan: number = this.anchorPointFormGroup.get(
          this.tileColSpanAlias
        )?.value;

        this.tileOps.createTile(
          this.rowIndex,
          this.colIndex,
          tileRowSpan,
          tileColSpan
        );
      },
      description: 'Add a new tile',
      color: 'green',
    },
    {
      type: ACTIONS.EDIT,
      getShowCondition: () =>
        !!this.tileOps.drawMatrix.drawMatrix[this.rowIndex][this.colIndex],
      icon: 'edit_note',
      getAction: () => {},
      description: 'Edit the tile',
      color: 'red',
    },
    {
      type: ACTIONS.REMOVE,
      getShowCondition: () =>
        !!this.tileOps.drawMatrix.drawMatrix[this.rowIndex][this.colIndex],
      icon: 'remove_circle_outline',
      getAction: () => {},
      description: 'Remove the tile',
      color: 'red',
    },
    {
      type: ACTIONS.CLEAR,
      getShowCondition: () => true,
      icon: 'delete_sweep',
      getAction: () => {
        this.tileOps.clearAllTiles();
      },
      description: 'Clear tiles',
      color: 'red',
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
