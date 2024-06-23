import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Student } from '../../../../models/student';
import { AppColumn } from '../../interfaces/appColumn';
import { CONTROL_TYPE } from '../../interfaces/inputTypes';

export const studentColumns: AppColumn<Student>[] = [
  {
    alias: 'id',
    placeholder: 'ID',
    headerControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<number | null>(null),
    },
    inlineControl: {
      type: CONTROL_TYPE.INPUT,
      getControl: () => new FormControl<number | null>(null),
    },
    notEditable: true,
  },
  {
    alias: 'firstName',
    placeholder: 'First Name',
    headerControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<string[]>([]),
    },
    inlineControl: {
      type: CONTROL_TYPE.INPUT,
      getControl: () =>
        new FormControl<string | null>(null, [
          Validators.required,
          Validators.minLength(2),
        ]),
    },
  },
  {
    alias: 'lastName',
    placeholder: 'Last Name',
    headerControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<string[]>([]),
    },
    inlineControl: {
      type: CONTROL_TYPE.INPUT,
      getControl: () =>
        new FormControl<string | null>(null, [
          Validators.required,
          Validators.minLength(2),
        ]),
    },
  },
  {
    alias: 'age',
    placeholder: 'Age',
    headerControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<number | null>(null),
    },
    inlineControl: {
      type: CONTROL_TYPE.INPUT,
      getControl: () =>
        new FormControl<number | null>(null, [
          Validators.required,
          Validators.max(150),
          Validators.min(15),
        ]),
    },
  },
  {
    alias: 'gender',
    placeholder: 'Gender',
    cell: (element: Student) => `${element.gender ? 'Male' : 'Female'}`,
    headerControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<boolean[]>([true, false]),
    },
    inlineControl: {
      type: CONTROL_TYPE.BOOLEAN,
      getControl: () => new FormControl<boolean | null>(null),
    },
  },
  {
    alias: 'enrollDate',
    placeholder: 'Enroll Date',
    cell: (element: Student) =>
      new Date(element.enrollDate).toISOString().split('T')[0],
    headerControl: {
      type: CONTROL_TYPE.DATE_RANGE,
      getControl: () =>
        new FormGroup({
          start: new FormControl<Date | null>(null),
          end: new FormControl<Date | null>(null),
        }),
    },
    inlineControl: {
      type: CONTROL_TYPE.DATE_INPUT,
      getControl: () => new FormControl<boolean | null>(null),
    },
  },
  {
    alias: 'about',
    placeholder: 'About',
    headerControl: {
      type: CONTROL_TYPE.INPUT,
      getControl: () => new FormControl<string | null>(null),
    },
    inlineControl: {
      type: CONTROL_TYPE.TEXT,
      getControl: () => new FormControl<string | null>(null),
    },
  },
  {
    alias: 'state',
    placeholder: 'State',
    headerControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<number | null>(null),
      dependentAliases: ['city'],
    },
    inlineControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<number | null>(null),
      dependentAliases: ['city'],
    },
  },
  {
    alias: 'city',
    placeholder: 'City',
    headerControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<number | null>(null),
    },
    inlineControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<number | null>(null),
    },
  },
];
