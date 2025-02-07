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
  public rowIndex: number = 0;
  public colIndex: number = 0;

  tileColSpanAlias: string = 'tile-col-span';
  tileRowSpanAlias: string = 'tile-row-span';
  formFieldsOnOffAlias: string = 'formFieldsOnOff';

  anchorPointFormGroup!: FormGroup;

  anchorPointFields!: AppEntity<T>[];

  formFieldsOnOffField: AppEntity<T>;

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
      description: 'Add new tile',
      color: 'green',
    },
    {
      type: ACTIONS.EDIT,
      getShowCondition: () =>
        !!this.tileOps.drawMatrix.drawMatrix[this.rowIndex][this.colIndex],
      icon: 'edit_note',
      getAction: () => {
        const tileRowSpan: number = this.anchorPointFormGroup.get(
          this.tileRowSpanAlias
        )?.value;
        const tileColSpan: number = this.anchorPointFormGroup.get(
          this.tileColSpanAlias
        )?.value;
        this.tileOps.editTile(
          this.rowIndex,
          this.colIndex,
          tileRowSpan,
          tileColSpan
        );
      },
      description: 'Edit tile',
      color: 'red',
    },
    {
      type: ACTIONS.REMOVE,
      getShowCondition: () =>
        !!this.tileOps.drawMatrix.drawMatrix[this.rowIndex][this.colIndex],
      icon: 'remove_circle_outline',
      getAction: () => {
        this.tileOps.removeTile(
          this.anchorPointFormGroup,
          this.formFieldsOnOffAlias,
          this.rowIndex,
          this.colIndex
        );
      },
      description: 'Remove tile',
      color: 'red',
    },
    {
      type: ACTIONS.DUPLICATE,
      getShowCondition: () =>
        !this.tileOps.drawMatrix.drawMatrix[this.rowIndex][this.colIndex],
      icon: 'control_point_duplicate',
      getAction: () => {
        this.tileOps.duplicateAnchorPointRow(this.rowIndex);
      },
      description: 'Duplicate form row',
      color: 'green',
    },
    {
      type: ACTIONS.DELETE,
      getShowCondition: () =>
        !this.tileOps.drawMatrix.drawMatrix[this.rowIndex][this.colIndex],
      icon: 'highlight_remove',
      getAction: () => {
        this.tileOps.deleteAnchorPointRow(this.rowIndex);
      },
      description: 'Delete current form row',
      color: 'red',
    },
  ];

  constructor(
    protected fb: FormBuilder,
    protected tileOps: TileEnhancedOperations<T>,
    protected toastrService: ToastrService
  ) {
    super();
    const activeFormElements = [...this.tileOps.drawMatrix.tiles.values()]
      .map((el) => el.cdkDropListData.map((tile) => tile.placeholder || ''))
      .flat()
      .filter((a) => this.tileOps.allFields.find((f) => f.placeholder === a));

    this.formFieldsOnOffField = {
      alias: this.formFieldsOnOffAlias,
      placeholder: 'Form fields on/off',
      mainControl: {
        type: CONTROL_TYPE.SELECT,
        getControl: () => new FormControl<string[]>(activeFormElements),
        filterLocalSource: this.tileOps.getSortedActiveFormElements,
      },
      action: this.enableDisableFormElements,
    };
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
    this.anchorPointFields.push(this.formFieldsOnOffField);

    this.anchorPointFormGroup = this.fb.group({});
    this.anchorPointFields.forEach((c) =>
      this.tileOps.addControlsToFormGroup(
        c.alias,
        c.mainControl,
        this.anchorPointFormGroup
      )
    );
  }

  public enableDisableFormElements = (alias: string, formGroup: FormGroup) => {
    const formControl = formGroup.get(alias);
    const matrix = this.tileOps.drawMatrix;
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
    const matrix = this.tileOps.drawMatrix;
    if (matrix.tiles.size) {
      const addedPlaceHolders = activePlaceHolders.filter(
        (item) => !activeFormElements.includes(item)
      );
      addedPlaceHolders.forEach((placeholder: string) => {
        const tileId: number = matrix.drawMatrix[this.rowIndex][this.colIndex];
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

  private disableFormElement(
    activePlaceHolders: string[],
    activeFormElements: string[]
  ): void {
    const matrix = this.tileOps.drawMatrix;
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
