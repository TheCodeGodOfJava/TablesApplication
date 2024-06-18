import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Id } from '../../models/id';

@Injectable({
  providedIn: 'root',
})
export class StateService<T> {
  constructor(private hc: HttpClient) {}

  public save(path: string, model: Id): Observable<T> {
    return this.hc.post<T>(`${environment.API_BASE_URL}${path}/save`, model);
  }

  public remove(controllerPath: string, ids: number[]): Observable<void> {
    return this.hc.request<void>(
      'delete',
      `${environment.API_BASE_URL}${controllerPath}/remove`,
      { body: ids }
    );
  }
}
