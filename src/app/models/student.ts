import { Id } from './id';

export interface Student extends Id {
  firstName: string;
  lastName: string;
  age: number;
  gender: boolean;
  about: string;
  enrollDate: string;
  country: string;
  state: string;
  city: string;
}
