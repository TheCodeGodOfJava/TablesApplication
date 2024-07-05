import { Id } from './id';

export interface Professor extends Id {
  firstName: string;
  lastName: string;
  subject: string;
  phone: string;
}
