import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Id } from '../../../../models/id';
import { LocalStorageService } from '../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../services/state/state.service';
import { AppEntity } from '../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../data-tables/interfaces/inputTypes';
import { formImports } from '../../form-imports/formImports';
import { FormActions } from '../../formActions';
import { Tile } from '../../interfaces/tile';
import { TileOperations } from './tile-operations';
import { FormContextMenuActions } from '../../formContextMenuActions';
import { ACTIONS } from '../../../data-tables/interfaces/appAction';

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

  enableFormConstructor: boolean = true;
  protected enabelFormStringSuffix: string = '_state';

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

  formContextMenuActions!: FormContextMenuActions<T>;

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
      this.formName + this.enabelFormStringSuffix
    );
    if (enableFormStr) {
      this.enableFormConstructor = JSON.parse(enableFormStr);
    }

    this.tiles
      .map((el) => el.cdkDropListData)
      .flat()
      .forEach((target) => {
        const source: AppEntity<T> | undefined = this.allFields.find(
          (f) => f.placeholder === target.placeholder
        );
        source && this.copyMatchingFields(source, target);
      });

    this.tileOps = new TileOperations<T>(
      this.allFields,
      this.formName,
      this.tiles,
      this.fb,
      this.localStorageService,
      this.toastrService
    );

    this.formContextMenuActions = new FormContextMenuActions(
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

  copyMatchingFields<T extends object>(source: T, target: T): void {
    for (const key in source) {
      if (!(key in target) || key === 'mainControl') {
        target[key] = source[key];
      }
    }
    for (const key in target) {
      if (!(key in source)) {
        source[key] = target[key];
      }
    }
  }

  enableDisableFormConstructor(): void {
    this.enableFormConstructor
      ? this.tileOps.tileFormGroup.enable()
      : this.tileOps.tileFormGroup.disable();

    this.tileOps.saveFormTemplate(
      this.enabelFormStringSuffix,
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
    this.setActionControlValue<string>(current.placeholder || '', ACTIONS.LABEL);
  }

  setActionControlValue<V>(value: V, actionType: ACTIONS) {
    const action = this.formContextMenuActions.allActions.find(
      (a) => (a.type === actionType)
    );
    const control = this.formContextMenuActions.formContextMenuFormGroup.get(
      action?.appEntity?.alias || ''
    );
    control?.setValue(value);
  }
}
