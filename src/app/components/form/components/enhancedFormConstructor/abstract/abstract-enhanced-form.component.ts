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
import { AnchorPointEnhancedContextMenuActions } from '../actions/anchorPointEnhancedContextMenuActions';
import { formEnhancedImports } from '../form-imports/formEnhancedImports';
import { TileEnhancedOperations } from './tile-enhanced-operations';
import { FormEnhancedActions } from '../actions/formEnhancedActions';
import { FormEnhancedContextMenuActions } from '../actions/formEnhancedContextMenuActions';

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

  draggedTile!: Tile<T>;
  isTileDraggable: boolean = true;

  @Input()
  detailId!: number;

  detail!: T;

  allFields!: AppEntity<T>[];

  public tileOps!: TileEnhancedOperations<T>;

  @Input() controllerPath!: string;

  formGroup!: FormGroup;

  isFormCtrOn: boolean = true;
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
  rowQty: number = this.colQty;
  rowHeight: number = 85;

  public mtx: FormMatrix<T> = {
    tiles: new Map<number, Tile<T>>(),
    mtx: Array.from({ length: this.colQty }, () => Array(this.colQty).fill(0)),
  };

  formActions!: FormEnhancedActions<T>;

  formCtxMenuActions!: FormEnhancedContextMenuActions<T>;
  apCtxMenuActions!: AnchorPointEnhancedContextMenuActions<T>;

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
      mtx: parsed.mtx,
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
      this.mtx = this.deserializeFormMatrix(matrixStr);
    }

    const enableFormStr = this.localStorageService.getItem(
      this.formName + this.enableFormStringSuffix
    );
    if (enableFormStr) {
      this.isFormCtrOn = JSON.parse(enableFormStr);
    }

    this.mtx.tiles.forEach((tile) => {
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
      this.mtx,
      this.fb,
      this.localStorageService,
      this.toastrService
    );
    this.apCtxMenuActions = new AnchorPointEnhancedContextMenuActions(
      this.fb,
      this.tileOps,
      this.toastrService
    );

    this.formCtxMenuActions = new FormEnhancedContextMenuActions(
      this.fb,
      this.formGroup,
      this.tileOps,
      this.apCtxMenuActions,
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

    this.saveFormConstructorState();
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

  saveFormConstructorState(): void {
    this.tileOps.saveFormTemplate(
      this.enableFormStringSuffix,
      JSON.stringify(this.isFormCtrOn)
    );
  }

  toggleFormConstructor(event: MatSlideToggleChange) {
    this.isFormCtrOn = event.checked;
    this.saveFormConstructorState();
  }

  setActiveFormFieldCtxMenu(current: AppEntity<T>) {
    this.formCtxMenuActions.currentFormElementForCtxMenu = current;
    this.setActionControlValue<boolean>(!current.disabled, ACTIONS.STATE);
    this.setActionControlValue<string>(current.color || '', ACTIONS.COLOR);
    this.setActionControlValue<string>(
      current.placeholder || '',
      ACTIONS.LABEL
    );
  }

  setActiveCoordinatesCtxMenu(y: number, x: number) {
    this.apCtxMenuActions.y = y;
    this.apCtxMenuActions.x = x;
  }

  public setActionControlValue<V>(value: V, actionType: ACTIONS) {
    const action = this.formCtxMenuActions.allActions.find(
      (a) => a.type === actionType
    );
    const control = this.formCtxMenuActions.formCtxMenuFormGroup.get(
      action?.appEntity?.alias || ''
    );
    control?.setValue(value);
  }

  public getTileExistsCondition(): boolean {
    return !!this.mtx.mtx[this.apCtxMenuActions.y][this.apCtxMenuActions.x];
  }

  public getApPositionStyles(y: number, x: number) {
    return {
      top: `${y * this.rowHeight + 3}px`,
      left: `calc(${this.tileMargin}px + 100% * ${x} / ${this.colQty})`,
      width: `calc(${-this.tileMargin * 2}px + 100% / ${this.colQty})`,
      height: `${this.rowHeight - this.tileMargin * 2}px`,
    };
  }

  public getTilePositionStyles(tile: Tile<T>) {
    return {
      ...this.getApPositionStyles(tile.y, tile.x),
      width: `calc(${-this.tileMargin * 2}px + ${tile.xSpan} * 100% / ${
        this.colQty
      })`,
      height: `${this.rowHeight * tile.ySpan - this.tileMargin * 2}px`,
    };
  }

  startDrag() {
    document.body.style.userSelect = 'none';
  }

  endDrag() {
    document.body.style.userSelect = 'auto';
  }

  startTileDrag(tile: Tile<T>) {
    document.body.style.userSelect = 'none';
    this.draggedTile = tile;
  }

  onTileDrop(yDrag: number, xDrag: number) {
    const hzOffset = xDrag - this.draggedTile.x;
    const vtOffset = this.draggedTile.y - yDrag;
    this.tileOps.editTile(
      this.draggedTile.y,
      this.draggedTile.x,
      this.draggedTile.ySpan,
      this.draggedTile.xSpan,
      {
        hz: hzOffset,
        vt: vtOffset,
      }
    );
    document.body.style.userSelect = 'auto';
  }

  onTileDragOver(event: DragEvent) {
    event.preventDefault();
  }

  getConnectedTiles(): string[] {
    return [...this.mtx.tiles.keys()].map((key) => key.toString());
  }
}
