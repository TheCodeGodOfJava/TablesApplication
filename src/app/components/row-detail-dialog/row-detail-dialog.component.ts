import { NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    NgIf,
  ],
  templateUrl: './row-detail-dialog.component.html',
  styleUrl: './row-detail-dialog.component.scss',
})
export class RowDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { rowId: number}) {}
}
