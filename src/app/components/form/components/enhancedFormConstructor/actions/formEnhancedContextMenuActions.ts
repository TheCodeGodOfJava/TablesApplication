import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Id } from '../../../../../models/id';
import { ACTIONS } from '../../../../data-tables/interfaces/ACTIONS';
import { AppAction } from '../../../../data-tables/interfaces/appAction';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../../data-tables/interfaces/inputTypes';
import { ProtoActions } from '../../../../protoActions';
import { TileEnhancedOperations } from '../abstract/tile-enhanced-operations';
import { AnchorPointEnhancedContextMenuActions } from './anchorPointEnhancedContextMenuActions';

export class FormEnhancedContextMenuActions<T extends Id> extends ProtoActions {
  currentFormElementForCtxMenu!: AppEntity<T>;

  override allActions: AppAction<AppEntity<T>>[] = [
    {
      type: ACTIONS.STATE,
      icon: 'published_with_changes',
      getShowCondition: (model: AppEntity<T>) => true,
      description: 'Enable/Disable',
      appEntity: {
        alias: 'changeStateAction',
        placeholder: '',
        mainControl: {
          type: CONTROL_TYPE.BOOLEAN,
          getControl: () => new FormControl<boolean | null>(null),
        },
        action: (alias: string, fromGroup: FormGroup) => {
          const value: boolean = fromGroup.get(alias)?.value;
          this.currentFormElementForCtxMenu.disabled = !value;
          const mainGroupFormControl = this.mainFormGroup.get(
            this.currentFormElementForCtxMenu.alias
          );
          value
            ? mainGroupFormControl?.enable()
            : mainGroupFormControl?.disable();
          this.toastrService.success('Form element state is changed!');
          this.tileOps.saveFormTemplate();
        },
      },
    },
    {
      type: ACTIONS.COLOR,
      icon: 'color_lens',
      getShowCondition: (model: AppEntity<T>) => true,
      description: 'Set color',
      appEntity: {
        alias: 'setColorAction',
        placeholder: '',
        mainControl: {
          type: CONTROL_TYPE.INPUT,
          getControl: () => new FormControl<string | null>(null),
        },
        action: (alias: string, fromGroup: FormGroup) => {
          const value: string = fromGroup.get(alias)?.value;
          this.currentFormElementForCtxMenu.color = value;
          this.tileOps.saveFormTemplate();
        },
      },
    },
    {
      type: ACTIONS.LABEL,
      icon: 'label',
      getShowCondition: (model: AppEntity<T>) => true,
      description: 'Set label',
      appEntity: {
        alias: 'setLabelAction',
        placeholder: '',
        mainControl: {
          type: CONTROL_TYPE.INPUT,
          getControl: () => new FormControl<string | null>(null),
        },
        action: (alias: string, fromGroup: FormGroup) => {
          const value: string = fromGroup.get(alias)?.value;
          this.currentFormElementForCtxMenu.placeholder = value;

          const fc = this.apCtxMenuActions.apFormGroup.get(
            this.apCtxMenuActions.onOffAlias
          );

          let selectedFormElements: string[] = fc?.value;
          const placeHolder = this.currentFormElementForCtxMenu.placeholder;
          selectedFormElements = selectedFormElements.filter(
            (item) => item !== placeHolder
          );
          selectedFormElements.push(value);

          fc?.setValue(selectedFormElements);

          this.tileOps.saveFormTemplate();
        },
      },
    },
  ];

  formCtxMenuFormGroup!: FormGroup;

  constructor(
    protected fb: FormBuilder,
    protected mainFormGroup: FormGroup,
    protected tileOps: TileEnhancedOperations<T>,
    protected apCtxMenuActions: AnchorPointEnhancedContextMenuActions<T>,
    protected toastrService: ToastrService
  ) {
    super();
    this.formCtxMenuFormGroup = this.fb.group({});
    this.allActions
      .map((a) => a.appEntity)
      .forEach(
        (c) =>
          !!c &&
          tileOps.addControlsToFormGroup(
            c.alias,
            c.mainControl,
            this.formCtxMenuFormGroup
          )
      );
  }
}
