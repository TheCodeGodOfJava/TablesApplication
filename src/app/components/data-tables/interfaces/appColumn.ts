import { FormControl } from '@angular/forms';

export interface AppColumn<T> {
  cell: (model: T) => any;
  alias: string;
  placeholder:string,
  formControl: FormControl;
}
