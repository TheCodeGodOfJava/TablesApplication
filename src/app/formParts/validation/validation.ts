import { ValidationErrors } from '@angular/forms';

export enum VALIDATION {
  REQUIRED = 'required',
  MAX_LENGTH = 'maxlength',
  MIN_LENGTH = 'minlength',
  MAX = 'max',
  MIN = 'min',
}

export function getValidationMessage(errors: ValidationErrors): string {
  let result: string;
  const error = errors && Object.keys(errors)[0];
  const validationType = convertErrorToValidationType(error);
  switch (validationType) {
    case VALIDATION.REQUIRED:
      result = ' is a mandatory field!';
      break;
    case VALIDATION.MAX_LENGTH:
      const maxlength = errors['maxlength'];
      result = ` must be less than ${maxlength['requiredLength']} characters long! And you've got ${maxlength['actualLength']}!`;
      break;
    case VALIDATION.MIN_LENGTH:
      const minlength = errors['minlength'];
      result = ` must be more than ${minlength['requiredLength']} characters long! And you've got only ${minlength['actualLength']}!`;
      break;
    case VALIDATION.MAX:
      const max = errors['max'];
      result = ` cannot be more than ${max['max']}! And you've got ${max['actual']}!`;
      break;
    case VALIDATION.MIN:
      const min = errors['min'];
      result = ` cannot be less than ${min['min']}! And you've got ${min['actual']}!`;
      break;
    default:
      result = '';
  }
  return result;
}

function convertErrorToValidationType(convertingStr: string): VALIDATION {
  if (Object.values(VALIDATION).includes(convertingStr as VALIDATION)) {
    return convertingStr as VALIDATION;
  } else {
    throw Error('No enum value with this key!');
  }
}
