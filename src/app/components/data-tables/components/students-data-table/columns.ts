import { FormControl, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { Student } from '../../../../models/student';
import { AppEntity } from '../../interfaces/appColumn';
import { CONTROL_TYPE } from '../../interfaces/inputTypes';

export const studentColumns: AppEntity<Student>[] = [
  {
    alias: 'id',
    placeholder: 'ID',
    mainControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<number | null>(null),
    },
    rowControl: {
      type: CONTROL_TYPE.INPUT,
      getControl: () => new FormControl<number | null>(null),
    },
    notEditable: true,
  },
  {
    alias: 'firstName',
    placeholder: 'First Name',
    mainControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<string[]>([]),
    },
    rowControl: {
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
    mainControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<string[]>([]),
    },
    rowControl: {
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
    mainControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<number | null>(null),
    },
    rowControl: {
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
    mainControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<string[]>([]),
      filterLocalSource: () => {
        return of(['true', 'false']);
      },
    },
    rowControl: {
      type: CONTROL_TYPE.BOOLEAN,
      getControl: () => new FormControl<boolean | null>(null),
    },
  },
  {
    alias: 'enrollDate',
    placeholder: 'Enroll Date',
    cell: (element: Student) =>
      new Date(element.enrollDate).toISOString().split('T')[0],
    mainControl: {
      type: CONTROL_TYPE.DATE_RANGE,
      getControl: () =>
        new FormGroup({
          start: new FormControl<Date | null>(null),
          end: new FormControl<Date | null>(null),
        }),
    },
    rowControl: {
      type: CONTROL_TYPE.DATE_INPUT,
      getControl: () => new FormControl<boolean | null>(null),
    },
  },
  {
    alias: 'about',
    placeholder: 'About',
    mainControl: {
      type: CONTROL_TYPE.INPUT,
      getControl: () => new FormControl<string | null>(null),
    },
    rowControl: {
      type: CONTROL_TYPE.TEXT,
      getControl: () => new FormControl<string | null>(null),
    },
  },

  {
    alias: 'country',
    placeholder: 'Country',
    mainControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<string | null>(null),
    },
    rowControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<string | null>(null),
    },
  },
  {
    alias: 'state',
    placeholder: 'State',
    mainControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<string | null>(null),
      dependentAliases: ['country'],
    },
    rowControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<string | null>(null),
      dependentAliases: ['country'],
    },
  },
  {
    alias: 'city',
    placeholder: 'City',
    mainControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<string | null>(null),
      dependentAliases: ['country', 'state'],
    },
    rowControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<string | null>(null),
      dependentAliases: ['country', 'state'],
    },
  },
];
