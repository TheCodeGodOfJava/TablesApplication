import { Student } from './student';

export interface StudentForm extends Student {
  phone: string;
  email: string;
}
