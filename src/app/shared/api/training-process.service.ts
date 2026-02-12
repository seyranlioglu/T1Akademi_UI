import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingProcessService {

  private apiUrl = environment.apiUrl + '/TrainingProcessRequest';

  constructor(private http: HttpClient) { }

  // 1. Bekleyen Talepleri Getir
  getPendingRequests(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/GetPendingRequests`);
  }

  // 2. Talebe Yanıt Ver (Onay veya Ret)
  // Backend parametreleri query string olarak bekliyor (C# kodunda [FromBody] yok)
  respondToRequest(requestId: number, isApproved: boolean, adminNote: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('requestId', requestId)
      .set('isApproved', isApproved);

    if (adminNote) {
      params = params.set('adminNote', adminNote);
    }

    return this.http.post<any>(`${this.apiUrl}/respond`, {}, { params: params });
  }
}