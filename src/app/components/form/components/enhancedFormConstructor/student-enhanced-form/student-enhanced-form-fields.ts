import { FormControl, Validators } from '@angular/forms';
import { Student } from '../../../../../models/student';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../../data-tables/interfaces/inputTypes';

export const studentFormFields: AppEntity<Student>[] = [
  {
    alias: 'id',
    placeholder: 'ID',
    mainControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl<number | null>(null),
    },
    disabled: true,
  },
  {
    alias: 'firstName',
    placeholder: 'First Name',
    mainControl: {
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
      type: CONTROL_TYPE.BOOLEAN,
      getControl: () => new FormControl<boolean | null>(null),
    },
  },
  {
    alias: 'enrollDate',
    placeholder: 'Enroll Date',

    mainControl: {
      type: CONTROL_TYPE.DATE_INPUT,
      getControl: () => new FormControl<boolean | null>(null),
    },
  },
  {
    alias: 'about',
    placeholder: 'About',

    mainControl: {
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
  },
  {
    alias: 'state',
    placeholder: 'State',
    mainControl: {
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
    iScroll: true
  },
  {
    alias: 'phone',
    placeholder: 'Phone',
    mainControl: {
      type: CONTROL_TYPE.INPUT,
      getControl: () => new FormControl<string | null>(null),
    },
  },
  {
    alias: 'email',
    placeholder: 'Email',
    mainControl: {
      type: CONTROL_TYPE.INPUT,
      getControl: () => new FormControl<string | null>(null),
    },
  },
];
