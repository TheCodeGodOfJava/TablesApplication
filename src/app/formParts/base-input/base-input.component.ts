import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AbstractFormComponent } from '../abstract/abstractFormComponent';
import { MatLabelScrollDirective } from '../../directives/mat-label-scroll/mat-label-scroll.directive';

@Component({
  selector: 'base-input',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    MatLabelScrollDirective,
  ],
  templateUrl: './base-input.component.html',
  styleUrl: './base-input.component.scss',
})
export class BaseInputComponent extends AbstractFormComponent {}
