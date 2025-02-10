import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Id } from '../../../../models/id';
import { ACTIONS } from '../../../data-tables/interfaces/ACTIONS';
import { AnchorPointAction } from '../../../data-tables/interfaces/anchorPointAction';
import { AppEntity } from '../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../data-tables/interfaces/inputTypes';
import { ProtoActions } from '../../../protoActions';
import { Tile } from '../../interfaces/tile';
import { TileEnhancedOperations } from './abstract/tile-enhanced-operations';

export class AnchorPointEnhancedContextMenuActions<
  T extends Id
> extends ProtoActions {
  public y: number = 0;
  public x: number = 0;

  tileColSpanAlias: string = 'tile-col-span';
  tileRowSpanAlias: string = 'tile-row-span';
  onOffAlias: string = 'formFieldsOnOff';

  apFormGroup!: FormGroup;

  apFields!: AppEntity<T>[];

  onOffField: AppEntity<T>;

  override allActions: AnchorPointAction[] = [
    {
      type: ACTIONS.CREATE,
      icon: 'add_circle_outline',
      getShowCondition: () => !this.tileOps.mtx.mtx[this.y][this.x],
      getAction: () => {
        const spans = this.getSpans();
        this.tileOps.createTile(this.y, this.x, spans.ySpan, spans.xSpan);
      },
      getDescription: () => 'Add new tile',
      color: 'green',
    },
    {
      type: ACTIONS.EDIT,
      getShowCondition: () => !!this.tileOps.mtx.mtx[this.y][this.x],
      icon: 'edit_note',
      getAction: () => {
        const spans = this.getSpans();
        this.tileOps.editTile(this.y, this.x, spans.ySpan, spans.xSpan);
      },
      getDescription: () => 'Edit tile',
      color: 'red',
    },
    {
      type: ACTIONS.REMOVE,
      getShowCondition: () => !!this.tileOps.mtx.mtx[this.y][this.x],
      icon: 'remove_circle_outline',
      getAction: () => {
        this.tileOps.removeTile(
          this.apFormGroup,
          this.onOffAlias,
          this.y,
          this.x
        );
      },
      getDescription: () => 'Remove tile',
      color: 'red',
    },
    {
      type: ACTIONS.DUPLICATE,
      getShowCondition: () => !this.tileOps.mtx.mtx[this.y][this.x],
      icon: 'control_point_duplicate',
      getAction: () => {
        this.tileOps.duplicateAnchorPointRow(this.y, this.getSpans().ySpan);
      },
      getDescription: () => {
        return `Add ${this.getSpans().ySpan} row(s) here`;
      },
      color: 'green',
    },
    {
      type: ACTIONS.DELETE,
      getShowCondition: () => !this.tileOps.mtx.mtx[this.y][this.x],
      icon: 'highlight_remove',
      getAction: () => {
        this.tileOps.deleteAnchorPointRow(this.y, this.getSpans().ySpan);
      },
      getDescription: () => {
        return `Delete ${this.getSpans().ySpan} row(s) here`;
      },
      color: 'red',
    },
  ];

  constructor(
    protected fb: FormBuilder,
    protected tileOps: TileEnhancedOperations<T>,
    protected toastrService: ToastrService
  ) {
    super();
    const activeFormElements = [...this.tileOps.mtx.tiles.values()]
      .map((el) => el.cdkDropListData.map((tile) => tile.placeholder || ''))
      .flat()
      .filter((a) => this.tileOps.allFields.find((f) => f.placeholder === a));

    this.onOffField = {
      alias: this.onOffAlias,
      placeholder: 'Form fields on/off',
      mainControl: {
        type: CONTROL_TYPE.SELECT,
        getControl: () => new FormControl<string[]>(activeFormElements),
        filterLocalSource: this.tileOps.getSortedActiveFormElements,
      },
      action: this.enableDisableFormElements,
    };
    this.apFields = [
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
    this.apFields.push(this.onOffField);

    this.apFormGroup = this.fb.group({});
    this.apFields.forEach((c) =>
      this.tileOps.addControlsToFormGroup(
        c.alias,
        c.mainControl,
        this.apFormGroup
      )
    );
  }

  public enableDisableFormElements = (alias: string, formGroup: FormGroup) => {
    const formControl = formGroup.get(alias);
    const matrix = this.tileOps.mtx;
    if (matrix.tiles.size) {
      if (formControl && formControl.value.length) {
        const activePlaceHolders = formControl.value;
        const activeFormElements = [...matrix.tiles.values()]
          .map((el) => el.cdkDropListData.map((tile) => tile.placeholder || ''))
          .flat();
        this.enableFormElements(activePlaceHolders, activeFormElements);
        this.disableFormElement(activePlaceHolders, activeFormElements);

        this.toastrService.success('Form configuration successfully changed!');
      }
    } else {
      formControl?.reset();
      this.toastrService.error(
        'No form containers found! Please add at least one form container!'
      );
    }
    this.tileOps.saveFormTemplate();
  };

  private enableFormElements(
    activePlaceHolders: string[],
    activeFormElements: string[]
  ): void {
    const matrix = this.tileOps.mtx;
    if (matrix.tiles.size) {
      const addedPlaceHolders = activePlaceHolders.filter(
        (item) => !activeFormElements.includes(item)
      );
      addedPlaceHolders.forEach((placeholder: string) => {
        const tileId: number = matrix.mtx[this.y][this.x];
        if (tileId) {
          const appForm = this.tileOps.allFields.find(
            (a) => a.placeholder === placeholder
          );
          const tile: Tile<T> | undefined = matrix.tiles.get(tileId);
          appForm && tile?.cdkDropListData.push(appForm);
        }
      });
    }
  }

  private getSpans(): { ySpan: number; xSpan: number } {
    const tileRowSpan: number = this.apFormGroup.get(
      this.tileRowSpanAlias
    )?.value;
    const tileColSpan: number = this.apFormGroup.get(
      this.tileColSpanAlias
    )?.value;
    return { ySpan: Number(tileRowSpan), xSpan: Number(tileColSpan) };
  }

  private disableFormElement(
    activePlaceHolders: string[],
    activeFormElements: string[]
  ): void {
    const matrix = this.tileOps.mtx;
    if (matrix.tiles.size) {
      const removedPlaceHolders = activeFormElements.filter(
        (item) => !activePlaceHolders.includes(item)
      );
      removedPlaceHolders.forEach((placeHolder) => {
        matrix.tiles.forEach((t) => {
          t.cdkDropListData = t.cdkDropListData.filter(
            (obj) => obj.placeholder !== placeHolder
          );
        });
      });
    }
  }
}
