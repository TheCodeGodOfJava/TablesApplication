import { FormControl } from '@angular/forms';
import { Student } from '../../../../models/student';
import { AppColumn } from '../../interfaces/appColumn';

export const studentColumns: AppColumn<Student>[] = [
  {
    alias: 'id',
    placeholder: 'ID',
    cell: (element: Student) => `${element.id}`,
    getFormControl: () => new FormControl<number | null>(null),
    notEditable: true
  },
  {
    alias: 'firstName',
    placeholder: 'First Name',
    cell: (element: Student) => `${element.firstName}`,
    getFormControl: () => new FormControl<string | null>(null),
  },
  {
    alias: 'lastName',
    placeholder: 'Last Name',
    cell: (element: Student) => `${element.lastName}`,
    getFormControl: () => new FormControl<string | null>(null),
  },
  {
    alias: 'age',
    placeholder: 'Age',
    cell: (element: Student) => `${element.age}`,
    getFormControl: () => new FormControl<number | null>(null),
  },
];
