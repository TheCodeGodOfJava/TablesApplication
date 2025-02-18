import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TileOperations } from './tile-operations';
import { Id } from '../../../../../models/id';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../../services/state/state.service';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../../data-tables/interfaces/inputTypes';
import { formImports } from '../form-imports/formImports';
import { FormContextMenuActions } from '../formContextMenuActions';
import { Tile } from '../../../interfaces/tile';
import { FormActions } from '../formActions';
import { ACTIONS } from '../../../../data-tables/interfaces/ACTIONS';

@Component({
  standalone: true,
  templateUrl: './abstract-form.component.html',
  styleUrl: './abstract-form.component.scss',
  imports: [formImports],
})
export abstract class AbstractFormComponent<T extends Id> implements OnInit {
  CONTROL_TYPE = CONTROL_TYPE;
  ACTIONS = ACTIONS;

  @Input()
  detailId!: number;

  detail!: T;

  allFields!: AppEntity<T>[];

  protected tileOps!: TileOperations<T>;

  @Input() controllerPath!: string;

  formGroup!: FormGroup;

  isFormCtrOn: boolean = true;
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

  formActions!: FormActions<T>;

  formCtxMenuActions!: FormContextMenuActions<T>;

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

  ngOnInit(): void {
    this.formActions = new FormActions(
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
      this.isFormCtrOn = JSON.parse(enableFormStr);
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

    this.tileOps = new TileOperations<T>(
      this.allFields,
      this.formName,
      this.tiles,
      this.fb,
      this.localStorageService,
      this.toastrService
    );

    this.formCtxMenuActions = new FormContextMenuActions(
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

  copyMatchingFields<T extends Record<string, any>>(
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
    this.isFormCtrOn
      ? this.tileOps.tileFormGroup.enable()
      : this.tileOps.tileFormGroup.disable();

    this.tileOps.saveFormTemplate(
      this.enableFormStringSuffix,
      JSON.stringify(this.isFormCtrOn)
    );
  }

  toggleFormConstructor(event: MatSlideToggleChange) {
    this.isFormCtrOn = event.checked;
    this.enableDisableFormConstructor();
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

  setActionControlValue<V>(value: V, actionType: ACTIONS) {
    const action = this.formCtxMenuActions.allActions.find(
      (a) => a.type === actionType
    );
    const control = this.formCtxMenuActions.formCtxMenuFormGroup.get(
      action?.appEntity?.alias || ''
    );
    control?.setValue(value);
  }
}
