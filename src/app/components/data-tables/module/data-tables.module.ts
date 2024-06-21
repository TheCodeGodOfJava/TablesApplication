import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseCheckboxComponent } from '../../../formParts/base-checkbox/base-checkbox.component';
import { BaseInputComponent } from '../../../formParts/base-input/base-input.component';
import { BaseSelectComponent } from '../../../formParts/base-select/base-select.component';
import { DateRangeInputComponent } from '../../../formParts/date-range-input/date-range-input.component';
import { BaseDatePickerComponent } from '../../../formParts/base-date-picker/base-date-picker.component';
import { BaseTextFieldComponent } from '../../../formParts/base-text-field/base-text-field.component';

@NgModule({
  declarations: [],
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    CommonModule,
    BaseSelectComponent,
    BaseInputComponent,
    BaseCheckboxComponent,
    DateRangeInputComponent,
    BaseDatePickerComponent,
    BaseTextFieldComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    CommonModule,
    BaseSelectComponent,
    BaseInputComponent,
    BaseCheckboxComponent,
    DateRangeInputComponent,
    BaseDatePickerComponent,
    BaseTextFieldComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class DataTablesModule {}
