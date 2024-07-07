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

  public getModelById(controllerPath: string, id: number): Observable<T> {
    const url = `${environment.API_BASE_URL}${controllerPath}/getOneById?id=${id}`;
    return this.hc.get<T>(url);
  }

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

  public unbind(
    controllerPath: string,
    ids: number[],
    masterId: number
  ): Observable<void> {
    return this.hc.request<void>(
      'delete',
      `${environment.API_BASE_URL}${controllerPath}/unbind&masterId=${masterId}`,
      { body: ids }
    );
  }
}
