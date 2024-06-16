export interface DtParam {
  sortAlias?: string;
  sortDir?: string;
  pageStart: number;
  pageOffset: number;
  aliases: string[];
  filters: Map<string, string> | null;
}
