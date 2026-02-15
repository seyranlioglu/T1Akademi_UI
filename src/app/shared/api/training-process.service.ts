import { HttpClient } from '@angular/common/http';
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

  // 2. Talebe Yanıt Ver (Onay / Ret / Revizyon)
  // Backend artık DTO bekliyor (Body içinde)
  respondToRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/respond`, data);
  }

  // 3. Süreç Geçmişini Getir (Eğitmen Dashboard & History)
  // Backend: [HttpGet("GetHistory/{trainingId}")]
  getHistory(trainingId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/GetHistory/${trainingId}`);
  }
}