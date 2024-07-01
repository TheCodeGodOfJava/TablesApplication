import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Id } from '../../../../models/id';
import { StateService } from '../../../../services/state/state.service';
import { AppEntity } from '../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../data-tables/interfaces/inputTypes';
import { formImports } from '../../form-imports/formImports';
import { FormOperations } from './form-operations';
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

  protected formOps!: FormOperations<T>;
  protected tileOps!: TileOperations<T>;

  @Input() controllerPath!: string;

  formGroup!: FormGroup;

  formBuilderFormGroup!: FormGroup;

  tileColSpanAlias: string = 'tile-col-span';
  tileRowSpanAlias: string = 'tile-row-span';
  formFieldsOnOffAlias: string = 'formFieldsOnOff';

  tileControls!: AppEntity<T>[];

  private _formName!: string;

  get formName(): string {
    if (!this._formName) {
      throw new Error('The name of the form is not set!');
    }
    return this._formName;
  }

  @Input()
  set formName(name: string) {
    this._formName = name;
  }

  constructor(
    protected fb: FormBuilder,
    protected stateService: StateService<T>,
    protected toastrService: ToastrService
  ) {
    this.formGroup = this.fb.group({});
  }

  ngOnInit(): void {
    this.tileOps = new TileOperations(this.toastrService);
    this.formOps = new FormOperations<T>(
      this.allFields,
      this.tileOps.tiles,
      this.fb,
      this.toastrService
    );
    if (this.allFields) {
      this.stateService
        .getModelById(this.controllerPath, this.detailId)
        .subscribe({
          next: (detail: T) => {
            this.detail = detail;
            this.allFields.forEach((c) =>
              this.formOps.addControlsToFormGroup(
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
          getControl: () => new FormControl<string[]>([]),
          filterLocalSource: this.formOps.getSortedActiveFormElements,
        },
        action: this.formOps.enableDisableFormElements,
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
      this.formOps.addControlsToFormGroup(
        c.alias,
        c.mainControl,
        this.formBuilderFormGroup
      )
    );
  }

  clearAllTiles() {
    this.formOps.activeFormElements = [];
    this.formBuilderFormGroup.get(this.formFieldsOnOffAlias)?.reset();
    this.tileOps.clearAllTiles();
  }

  removeLast() {
    const removeCallback = (newActiveFormElements: string[] | null) => {
      this.formOps.activeFormElements =
        newActiveFormElements === null
          ? []
          : this.formOps.activeFormElements.filter(
              (item) => !newActiveFormElements.includes(item)
            );
    };
    this.tileOps.removeLast(
      this.formFieldsOnOffAlias,
      this.formBuilderFormGroup,
      removeCallback
    );
  }
}
