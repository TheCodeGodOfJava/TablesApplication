import { Id } from './id';

export interface Student extends Id {
  firstName: string;
  lastName: string;
  age: number;
}
