import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserMenuResponseDto } from '../models/user-menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  // Backend API adresin environment'tan gelir
  private apiUrl = `${environment.apiUrl}/Menu`;

  constructor(private http: HttpClient) { }

  getMyMenu(): Observable<any> {
    // Backend Wrapper ile dönüyordu: { data: { isInstructor: true, menuItems: [...] }, success: true }
    // Response yapına göre burayı map'leyebiliriz ama genelde direkt çağırıyoruz.
    return this.http.get<UserMenuResponseDto>(`${this.apiUrl}/my-menu`);
  }
}