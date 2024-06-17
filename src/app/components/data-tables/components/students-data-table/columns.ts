import { FormControl } from '@angular/forms';
import { Student } from '../../../../models/student';
import { AppColumn } from '../../interfaces/appColumn';

export const customerWorkOrderColumns: AppColumn<Student>[] = [
  {
    alias: 'id',
    placeholder: 'ID',
    cell: (element: Student) => `${element.id}`,
    formControl: new FormControl<number | null>(null),
  },
  {
    alias: 'firstName',
    placeholder: 'First Name',
    cell: (element: Student) => `${element.firstName}`,
    formControl: new FormControl<string | null>(null),
  },
  {
    alias: 'lastName',
    placeholder: 'Last Name',
    cell: (element: Student) => `${element.lastName}`,
    formControl: new FormControl<string | null>(null),
  },
  {
    alias: 'age',
    placeholder: 'Age',
    cell: (element: Student) => `${element.age}`,
    formControl: new FormControl<number | null>(null),
  },
];
