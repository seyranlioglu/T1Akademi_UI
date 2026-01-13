import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserMenuResponse, MenuItemDto } from '../models/user-menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMyMenu(): Observable<MenuItemDto[]> {
    return this.http.get<UserMenuResponse>(`${this.apiUrl}/Menu/my-menu`).pipe(
      map(response => {
        // Backend'den gelen 'header.result' kontrol ediliyor
        if (response && response.header && response.header.result) {
          return response.body.menuItems;
        }
        return [];
      })
    );
  }
}