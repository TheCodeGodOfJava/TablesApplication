import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [],
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, CommonModule],
  exports: [MatTableModule, MatSortModule, MatPaginatorModule, CommonModule],
})
export class DataTablesModule {}
