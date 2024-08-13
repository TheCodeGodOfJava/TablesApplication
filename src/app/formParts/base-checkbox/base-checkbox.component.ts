import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AbstractFormElementComponent } from '../abstract/abstractFormElementComponent';

@Component({
  selector: 'base-checkbox',
  standalone: true,
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    MatCheckboxModule,
  ],
  templateUrl: './base-checkbox.component.html',
  styleUrl: './base-checkbox.component.scss',
})
export class BaseCheckboxComponent extends AbstractFormElementComponent {
  @Input()
  outputStringValue!: string;
}
