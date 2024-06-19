import { FormControl, Validators } from '@angular/forms';
import { Student } from '../../../../models/student';
import { AppColumn } from '../../interfaces/appColumn';

export const studentColumns: AppColumn<Student>[] = [
  {
    alias: 'id',
    placeholder: 'ID',
    cell: (element: Student) => `${element.id}`,
    getHeaderControl: () => new FormControl<number | null>(null),
    getInlineControl: () => new FormControl<null>(null),
    notEditable: true,
    isMulti: false,
  },
  {
    alias: 'firstName',
    placeholder: 'First Name',
    cell: (element: Student) => `${element.firstName}`,
    getHeaderControl: () => new FormControl<string[]>([]),
    getInlineControl: () => new FormControl<string | null>(null),
    inlineValidators: [Validators.required, Validators.minLength(2)],
    isMulti: true,
  },
  {
    alias: 'lastName',
    placeholder: 'Last Name',
    cell: (element: Student) => `${element.lastName}`,
    getHeaderControl: () => new FormControl<string[]>([]),
    getInlineControl: () => new FormControl<string | null>(null),
    inlineValidators: [Validators.required, Validators.minLength(2)],
    isMulti: true,
  },
  {
    alias: 'age',
    placeholder: 'Age',
    cell: (element: Student) => `${element.age}`,
    getHeaderControl: () => new FormControl<number | null>(null),
    getInlineControl: () => new FormControl<number | null>(null),
    inlineValidators: [
      Validators.required,
      Validators.max(150),
      Validators.min(15),
    ],
    isMulti: false,
  },
];
