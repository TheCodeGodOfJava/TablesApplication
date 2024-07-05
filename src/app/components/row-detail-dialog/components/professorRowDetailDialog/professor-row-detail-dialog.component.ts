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
import { AbstractRowDetailDialogComponent } from '../abstract/abstract-row-detail-dialog.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { ProfessorTabGroupComponent } from "../../../detail-tabs/professor-tab-group/professor-tab-group.component";

@Component({
    selector: 'professor-detail-dialog',
    standalone: true,
    templateUrl: './professor-row-detail-dialog.component.html',
    styleUrl: './professor-row-detail-dialog.component.scss',
    providers: [
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
    ],
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatButtonModule,
        CommonModule,
        ProfesorTabGroupComponent,
        ProfessorTabGroupComponent
    ]
})
export class ProfessorRowDetailDialogComponent extends AbstractRowDetailDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public override data: { rowId: number }
  ) {
    super(data);
  }
}
