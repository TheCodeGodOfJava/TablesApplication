import { FormControl, Validators } from '@angular/forms';
import { Professor } from '../../../../models/professor';
import { AppEntity } from '../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../data-tables/interfaces/inputTypes';

export const professorFormFields: AppEntity<Professor>[] = [
  {
    alias: 'id',
    placeholder: 'ID',
    mainControl: {
      type: CONTROL_TYPE.SELECT,
      getControl: () =>
        new FormControl<number | null>({ value: null, disabled: true }),
    },
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
    alias: 'subject',
    placeholder: 'Subject',
    mainControl: {
      type: CONTROL_TYPE.INPUT,
      getControl: () => new FormControl<string | null>(null),
    },
  },
  {
    alias: 'phone',
    placeholder: 'Phone',
    mainControl: {
      type: CONTROL_TYPE.INPUT,
      getControl: () => new FormControl<string | null>(null),
    },
  },
];
