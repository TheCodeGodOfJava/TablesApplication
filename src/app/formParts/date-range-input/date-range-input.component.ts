import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AbstractFormComponent } from '../abstract/abstractFormComponent';

@Component({
  selector: 'date-range-input',
  standalone: true,
  templateUrl: './date-range-input.component.html',
  styleUrl: './date-range-input.component.scss',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatNativeDateModule,
  ],
})
export class DateRangeInputComponent extends AbstractFormComponent {}
