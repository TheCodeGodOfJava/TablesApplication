import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Id } from '../../../../../models/id';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../../services/state/state.service';
import { ACTIONS } from '../../../../data-tables/interfaces/ACTIONS';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../../data-tables/interfaces/inputTypes';
import { FormMatrix } from '../../../interfaces/formMatrix';
import { Tile } from '../../../interfaces/tile';
import { AnchorPointEnhancedContextMenuActions } from '../anchorPointEnhancedContextMenuActions';
import { formEnhancedImports } from '../form-imports/formEnhancedImports';
import { FormEnhancedActions } from '../formEnhancedActions';
import { FormEnhancedContextMenuActions } from '../formEnhancedContextMenuActions';
import { TileEnhancedOperations } from './tile-enhanced-operations';

@Component({
  standalone: true,
  templateUrl: './abstract-enhanced-form.component.html',
  styleUrl: './abstract-enhanced-form.component.scss',
  imports: [formEnhancedImports],
})
export abstract class AbstractEnhancedFormComponent<T extends Id>
  implements OnInit
{
  CONTROL_TYPE = CONTROL_TYPE;
  ACTIONS = ACTIONS;

  tileMargin: number = 3;
  multiplier: number = 2;

  @Input()
  detailId!: number;

  detail!: T;

  allFields!: AppEntity<T>[];

  protected tileOps!: TileEnhancedOperations<T>;

  @Input() controllerPath!: string;

  formGroup!: FormGroup;

  enableFormConstructor: boolean = true;
  protected enableFormStringSuffix: string = '_state';

  tileControls!: AppEntity<T>[];

  private _formName!: string;

  get formName(): string {
    if (!this._formName) {
      throw new Error('The name of the form is not set!');
    }
    return this._formName;
  }

  colQty: number = 8;
  rowHeight: number = 85;

  protected drawMatrix: FormMatrix<T> = {
    tiles: new Map<number, Tile<T>>(),
    drawMatrix: Array.from({ length: this.colQty }, () =>
      Array(this.colQty).fill(0)
    ),
  };

  formActions!: FormEnhancedActions<T>;

  formContextMenuActions!: FormEnhancedContextMenuActions<T>;
  anchorPointContextMenuActions!: AnchorPointEnhancedContextMenuActions<T>;

  @Input()
  set formName(name: string) {
    this._formName = name;
  }

  constructor(
    protected fb: FormBuilder,
    protected stateService: StateService<T>,
    protected localStorageService: LocalStorageService,
    protected toastrService: ToastrService
  ) {
    this.formGroup = this.fb.group({});
  }

  private deserializeFormMatrix<T>(json: string): FormMatrix<T> {
    const parsed = JSON.parse(json);
    const tiles = new Map<number, Tile<T>>(parsed.tiles);

    return {
      tiles,
      drawMatrix: parsed.drawMatrix,
    };
  }

  ngOnInit(): void {
    this.formActions = new FormEnhancedActions(
      this.controllerPath,
      this.formGroup,
      this.stateService,
      this.toastrService
    );
    const matrixStr = this.localStorageService.getItem(this.formName);
    if (matrixStr) {
      this.drawMatrix = this.deserializeFormMatrix(matrixStr);
    }

    const enableFormStr = this.localStorageService.getItem(
      this.formName + this.enableFormStringSuffix
    );
    if (enableFormStr) {
      this.enableFormConstructor = JSON.parse(enableFormStr);
    }

    this.drawMatrix.tiles.forEach((tile) => {
      const updatedData = tile.cdkDropListData
        .map((source) => {
          const target: AppEntity<T> | undefined = this.allFields.find(
            (f) => f.alias === source.alias
          );
          if (target) {
            this.copyMatchingFields(source, target);
            return target;
          }
          return undefined;
        })
        .filter((item): item is AppEntity<T> => item !== undefined);
      tile.cdkDropListData = updatedData;
    });

    this.tileOps = new TileEnhancedOperations<T>(
      this.allFields,
      this.formName,
      this.colQty,
      this.drawMatrix,
      this.fb,
      this.localStorageService,
      this.toastrService
    );
    this.anchorPointContextMenuActions =
      new AnchorPointEnhancedContextMenuActions(
        this.fb,
        this.tileOps,
        this.toastrService
      );

    this.formContextMenuActions = new FormEnhancedContextMenuActions(
      this.fb,
      this.formGroup,
      this.tileOps,
      this.anchorPointContextMenuActions,
      this.toastrService
    );

    if (this.allFields) {
      this.stateService
        .getModelById(this.controllerPath, this.detailId)
        .subscribe({
          next: (detail: T) => {
            this.detail = detail;
            this.allFields.forEach((c) => {
              this.tileOps.addControlsToFormGroup(
                c.alias,
                c.mainControl,
                this.formGroup,
                this.detail
              );
              const formControl = this.formGroup.get(c.alias);
              c.disabled ? formControl?.disable() : formControl?.enable();
            });
          },
          error: (error) => {
            console.error('error:', error);
            this.toastrService.error(
              `Error occured! Failed to download the detail with id = ${this.detailId}`
            );
          },
        });
    }

    this.enableDisableFormConstructor();
  }

  private copyMatchingFields<T extends Record<string, any>>(
    source: T,
    target: T
  ): void {
    const fields: string[] = Object.keys(target).filter(
      (key) => typeof target[key] !== 'object'
    );
    fields.forEach((field) => {
      const sourceValue = source[field];
      sourceValue && ((target as Record<string, any>)[field] = sourceValue);
    });
  }

  enableDisableFormConstructor(): void {
    this.tileOps.saveFormTemplate(
      this.enableFormStringSuffix,
      JSON.stringify(this.enableFormConstructor)
    );
  }

  toggleFormConstructor(event: MatSlideToggleChange) {
    this.enableFormConstructor = event.checked;
    this.enableDisableFormConstructor();
  }

  setCurrentFormElementForContextMenu(current: AppEntity<T>) {
    this.formContextMenuActions.currentFormElementForContextMenu = current;
    this.setActionControlValue<boolean>(!current.disabled, ACTIONS.STATE);
    this.setActionControlValue<string>(current.color || '', ACTIONS.COLOR);
    this.setActionControlValue<string>(
      current.placeholder || '',
      ACTIONS.LABEL
    );
  }

  setCurrentRowColumnForContextMenu(rowIndex: number, colIndex: number) {
    this.anchorPointContextMenuActions.rowIndex = rowIndex;
    this.anchorPointContextMenuActions.colIndex = colIndex;
  }

  private setActionControlValue<V>(value: V, actionType: ACTIONS) {
    const action = this.formContextMenuActions.allActions.find(
      (a) => a.type === actionType
    );
    const control = this.formContextMenuActions.formContextMenuFormGroup.get(
      action?.appEntity?.alias || ''
    );
    control?.setValue(value);
  }

  public getAnchorPointPositionStyles(rowIndex: number, colIndex: number) {
    return {
      top: `${rowIndex * this.rowHeight + 3}px`,
      left: `calc(${this.tileMargin}px + 100% * ${colIndex} / ${this.colQty})`,
      width: `calc(${-this.tileMargin * 2}px + 100% / ${this.colQty})`,
      height: `${this.rowHeight - this.tileMargin * 2}px`,
    };
  }

  public getTilePositionStyles(
    rowIndex: number,
    colIndex: number,
    tile: Tile<T>
  ) {
    return {
      ...this.getAnchorPointPositionStyles(rowIndex, colIndex),
      width: `calc(${-this.tileMargin * 2}px + ${tile.colSpan} * 100% / ${
        this.colQty
      })`,
      height: `${this.rowHeight * tile.rowSpan - this.tileMargin * 2}px`,
    };
  }
}
