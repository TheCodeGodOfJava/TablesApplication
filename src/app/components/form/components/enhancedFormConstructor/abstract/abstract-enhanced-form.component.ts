import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { debounceTime, fromEvent, map, Observable, startWith } from 'rxjs';
import { Id } from '../../../../../models/id';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../../services/state/state.service';
import { ACTIONS } from '../../../../data-tables/interfaces/appAction';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../../data-tables/interfaces/inputTypes';
import { Tile } from '../../../interfaces/tile';
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

  protected tiles: Tile<T>[] = [];

  get formName(): string {
    if (!this._formName) {
      throw new Error('The name of the form is not set!');
    }
    return this._formName;
  }

  formActions!: FormEnhancedActions<T>;

  formContextMenuActions!: FormEnhancedContextMenuActions<T>;

  @Input()
  set formName(name: string) {
    this._formName = name;
  }

  windowWidthObs: Observable<number>;

  constructor(
    protected fb: FormBuilder,
    protected stateService: StateService<T>,
    protected localStorageService: LocalStorageService,
    protected toastrService: ToastrService
  ) {
    this.formGroup = this.fb.group({});
    this.windowWidthObs = fromEvent(window, 'resize').pipe(
      debounceTime(300),
      map(() => window.innerWidth),
      startWith(window.innerWidth)
    );
  }

  ngOnInit(): void {
    this.formActions = new FormEnhancedActions(
      this.controllerPath,
      this.formGroup,
      this.stateService,
      this.toastrService
    );
    const tilesStr = this.localStorageService.getItem(this.formName);
    if (tilesStr) {
      this.tiles = JSON.parse(tilesStr);
    }

    const enableFormStr = this.localStorageService.getItem(
      this.formName + this.enableFormStringSuffix
    );
    if (enableFormStr) {
      this.enableFormConstructor = JSON.parse(enableFormStr);
    }

    this.tiles.forEach((tile) => {
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
      this.tiles,
      this.fb,
      this.localStorageService,
      this.toastrService
    );

    this.formContextMenuActions = new FormEnhancedContextMenuActions(
      this.fb,
      this.formGroup,
      this.tileOps,
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
    this.enableFormConstructor
      ? this.tileOps.tileFormGroup.enable()
      : this.tileOps.tileFormGroup.disable();

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

  private setActionControlValue<V>(value: V, actionType: ACTIONS) {
    const action = this.formContextMenuActions.allActions.find(
      (a) => a.type === actionType
    );
    const control = this.formContextMenuActions.formContextMenuFormGroup.get(
      action?.appEntity?.alias || ''
    );
    control?.setValue(value);
  }
}
