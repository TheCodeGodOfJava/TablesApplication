export interface Id {
  id: number;
}

export interface ExtendedId extends Id {
  [key: string]: any;
}
