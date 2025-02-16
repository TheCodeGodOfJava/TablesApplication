import { Observable } from 'rxjs';

export interface DepData {
  options: Observable<string[]>;
  lastLoadedPage: number;
  currentTerm: string;
  currentPage: number;
  loadedOptions: string[];
}
