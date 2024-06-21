import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLabelScrollDirective } from '../../directives/mat-label-scroll/mat-label-scroll.directive';
import { BaseInputComponent } from '../base-input/base-input.component';

@Component({
  selector: 'base-text-field',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    MatLabelScrollDirective,
  ],
  templateUrl: './base-text-field.component.html',
  styleUrl: './base-text-field.component.scss',
})
export class BaseTextFieldComponent extends BaseInputComponent {}
