import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserMenu } from '../models/user-menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuApiService {

  private apiUrl = environment.apiUrl; // environment.ts'de tanımlı olmalı

  constructor(private http: HttpClient) { }

  // Backend'deki MenuController/GetMyMenu endpoint'ini çağırır
  getMyMenu(): Observable<UserMenu[]> {
    return this.http.get<any>(this.apiUrl + '/Menu/my-menu').pipe(
      map(response => {
        // Backend Response<T> döndüğü için response.data veya response.body'yi alıyoruz
        if (response && response.isSuccess) {
            return response.data; 
        }
        return [];
      })
    );
  }
}