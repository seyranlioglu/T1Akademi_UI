import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_TYPES_URL = `${environment.apiUrl}/Type`;
@Injectable({
  providedIn: 'root',
})
export class TypesApiService {
  constructor(private http: HttpClient) { }

  getTypes(typeEntity: string): Observable<any> {
    return this.http.post<any>(`${API_TYPES_URL}/GetList?typeEntity=${typeEntity}`, {});
  }
}
