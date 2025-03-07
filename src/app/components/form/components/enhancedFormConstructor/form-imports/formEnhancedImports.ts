import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContextMenuTriggerDirective } from '../../../../../directives/context-menu/context-menu.directive';
import { BaseCheckboxComponent } from '../../../../../formParts/base-checkbox/base-checkbox.component';
import { BaseDatePickerComponent } from '../../../../../formParts/base-date-picker/base-date-picker.component';
import { BaseInputComponent } from '../../../../../formParts/base-input/base-input.component';
import { BaseSelectComponent } from '../../../../../formParts/base-select/base-select.component';
import { BaseTextFieldComponent } from '../../../../../formParts/base-text-field/base-text-field.component';

export const formEnhancedImports = [
  MatDividerModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule,
  MatCardModule,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  CommonModule,
  MatSelectModule,
  MatFormFieldModule,
  BaseSelectComponent,
  BaseInputComponent,
  BaseCheckboxComponent,
  BaseDatePickerComponent,
  BaseTextFieldComponent,
  MatInputModule,
  MatSlideToggleModule,
  MatMenuModule,
  ContextMenuTriggerDirective,
];
