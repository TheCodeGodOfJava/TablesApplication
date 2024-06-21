import { Id } from './id';

export interface Student extends Id {
  firstName: string;
  lastName: string;
  age: number;
  gender: boolean;
  about: string;
  enrollDate: string;
}
