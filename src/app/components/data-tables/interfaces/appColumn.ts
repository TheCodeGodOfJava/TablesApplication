export interface AppColumn<T> {
  cell: (model: T) => any;
  alias: string;
}
