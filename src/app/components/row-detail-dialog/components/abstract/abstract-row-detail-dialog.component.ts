import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

@Component({
  template: '',
})
export abstract class AbstractRowDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { rowId: number }) {}
}
