import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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

@Component({
  standalone: true,
  templateUrl: './abstract-form.component.html',
  styleUrl: './abstract-form.component.scss',
  imports: [formImports],
})
export abstract class AbstractFormComponent<T extends Id> implements OnInit {
  CONTROL_TYPE = CONTROL_TYPE;

  @Input()
  detailId!: number;

  detail!: T;

  protected allFields!: AppEntity<T>[];

  protected tileOps!: TileOperations<T>;

  @Input() controllerPath!: string;

  formGroup!: FormGroup;

  formBuilderFormGroup!: FormGroup;

  tileColSpanAlias: string = 'tile-col-span';
  tileRowSpanAlias: string = 'tile-row-span';
  formFieldsOnOffAlias: string = 'formFieldsOnOff';

  protected enableFormConstructor: boolean = true;
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

    const activeFormElements = this.tiles
      .map((el) => el.cdkDropListData.map((tile) => tile.placeholder || ''))
      .flat()
      .filter((a) => this.allFields.find((f) => f.placeholder === a));

    this.tileOps = new TileOperations<T>(
      this.allFields,
      this.formName,
      this.tiles,
      this.fb,
      this.localStorageService,
      this.toastrService
    );

    if (this.allFields) {
      this.stateService
        .getModelById(this.controllerPath, this.detailId)
        .subscribe({
          next: (detail: T) => {
            this.detail = detail;
            this.allFields.forEach((c) =>
              this.tileOps.addControlsToFormGroup(
                c.alias,
                c.mainControl,
                this.formGroup,
                this.detail
              )
            );
          },
          error: (error) => {
            console.error('error:', error);
            this.toastrService.error(
              `Error occured! Failed to download the detail with id = ${this.detailId}`
            );
          },
        });
    }
    this.tileControls = [
      {
        alias: this.formFieldsOnOffAlias,
        placeholder: 'Form fields on/off',
        mainControl: {
          type: CONTROL_TYPE.SELECT,
          getControl: () => new FormControl<string[]>(activeFormElements),
          filterLocalSource: this.tileOps.getSortedActiveFormElements,
        },
        action: this.tileOps.enableDisableFormElements,
      },
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
    this.formBuilderFormGroup = this.fb.group({});
    this.tileControls.forEach((c) =>
      this.tileOps.addControlsToFormGroup(
        c.alias,
        c.mainControl,
        this.formBuilderFormGroup
      )
    );
    this.enableDisableFormConstructor();
  }

  enableDisableFormConstructor(): void {
    this.enableFormConstructor
      ? this.formBuilderFormGroup.enable()
      : this.formBuilderFormGroup.disable();

    this.tileOps.saveFormTemplate(
      this.enabelFormStringSuffix,
      JSON.stringify(this.enableFormConstructor)
    );
  }

  clearAllTiles() {
    this.formBuilderFormGroup.get(this.formFieldsOnOffAlias)?.reset();
    this.tileOps.clearAllTiles();
  }

  removeLast() {
    this.tileOps.removeLast(
      this.formFieldsOnOffAlias,
      this.formBuilderFormGroup
    );
  }

  toggleFormConstructor(event: MatSlideToggleChange) {
    this.enableFormConstructor = event.checked;
    this.enableDisableFormConstructor();
  }
}
