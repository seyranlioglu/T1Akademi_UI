import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingQualityScoreApiService {

  // Backend Controller Rotası
  private controllerUrl = `${environment.apiUrl}/TrainingQualityScore`;

  constructor(private http: HttpClient) { }

  /**
   * Belirtilen eğitimin kalite puanını ve detaylarını getirir.
   * Endpoint: GET api/TrainingQualityScore/GetScore/{trainingId}
   */
  getScore(trainingId: number): Observable<any> {
    return this.http.get<any>(`${this.controllerUrl}/GetScore/${trainingId}`);
  }

  /**
   * Skoru manuel olarak yeniden hesaplatır (Admin tetiklemesi için).
   * Endpoint: POST api/TrainingQualityScore/Recalculate/{trainingId}
   */
  recalculateScore(trainingId: number): Observable<any> {
    return this.http.post<any>(`${this.controllerUrl}/Recalculate/${trainingId}`, {});
  }
}