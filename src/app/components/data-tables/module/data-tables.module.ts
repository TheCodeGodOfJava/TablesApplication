import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [],
  imports: [MatTableModule, MatSortModule, CommonModule],
  exports: [MatTableModule, MatSortModule, CommonModule],
})
export class DataTablesModule {}
