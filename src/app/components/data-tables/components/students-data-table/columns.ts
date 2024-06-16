import { Student } from '../../../../models/student';
import { AppColumn } from '../../interfaces/appColumn';

export const customerWorkOrderColumns: AppColumn<Student>[] = [
  {
    alias: 'id',
    cell: (element: Student) => `${element.id}`,
  },
  {
    alias: 'firstName',
    cell: (element: Student) => `${element.firstName}`,
  },
  {
    alias: 'lastName',
    cell: (element: Student) => `${element.lastName}`,
  },
  {
    alias: 'age',
    cell: (element: Student) => `${element.age}`,
  },
];
