import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { StudentTabGroupComponent } from '../../../detail-tabs/student-tab-group/student-tab-group.component';
import { AbstractRowDetailDialogComponent } from '../abstract/abstract-row-detail-dialog.component';

@Component({
  selector: 'student-detail-dialog',
  standalone: true,
  templateUrl: './student-row-detail-dialog.component.html',
  styleUrl: './student-row-detail-dialog.component.scss',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    CommonModule,
    StudentTabGroupComponent,
  ],
})
export class StudentRowDetailDialogComponent extends AbstractRowDetailDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public override data: { rowId: number }
  ) {
    super(data);
  }
}
