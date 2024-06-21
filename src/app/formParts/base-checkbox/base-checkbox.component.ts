import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatLabelScrollDirective } from '../../directives/mat-label-scroll/mat-label-scroll.directive';
import { AbstractFormComponent } from '../abstract/abstractFormComponent';

@Component({
  selector: 'base-checkbox',
  standalone: true,
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    MatCheckboxModule,
    MatLabelScrollDirective,
  ],
  templateUrl: './base-checkbox.component.html',
  styleUrl: './base-checkbox.component.scss',
})
export class BaseCheckboxComponent extends AbstractFormComponent {}
