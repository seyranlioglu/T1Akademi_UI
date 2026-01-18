import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { 
  ContinueTrainingDto, 
  DashboardStatsDto, 
  TrainingCardDto, 
  UserCertificateDto 
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  // Dashboard controller için base URL
  private dashboardUrl = environment.apiUrl + '/Dashboard';
  
  // Diğer controllerlar için ana API URL'i
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // 1. DÜZELTME: Backend 'continue-learning' bekliyor
  getContinueLearning(): Observable<ContinueTrainingDto | null> {
    return this.http.get<any>(`${this.dashboardUrl}/continue-learning`).pipe(
      map(res => {
          // Backend Response yapısına göre datayı al
          // Genelde: { success: true, data: {...} } veya direkt result
          const data = res.data || res.result || res.body;
          return data ? data : null;
      })
    );
  }

  // 2. DÜZELTME: Backend 'stats' bekliyor
  getStats(): Observable<DashboardStatsDto | null> {
    return this.http.get<any>(`${this.dashboardUrl}/stats`).pipe(
      map(res => {
          const data = res.data || res.result || res.body;
          return data ? data : null;
      })
    );
  }

  // 3. DÜZELTME: Backend 'assigned-trainings' bekliyor
  getAssignedTrainings(): Observable<TrainingCardDto[]> {
    return this.http.get<any>(`${this.dashboardUrl}/assigned-trainings`).pipe(
      map(res => {
          const data = res.data || res.result || res.body;
          return Array.isArray(data) ? data : [];
      })
    );
  }

  // 4. DÜZELTME: Backend 'recommended-trainings' bekliyor
  getRecommendedTrainings(): Observable<TrainingCardDto[]> {
    return this.http.get<any>(`${this.dashboardUrl}/recommended-trainings`).pipe(
      map(res => {
          const data = res.data || res.result || res.body;
          return Array.isArray(data) ? data : [];
      })
    );
  }

  // Sertifikalar farklı controller'da olduğu için URL yapısı farklı olabilir
  // Ama UserCertificateController'da endpoint adı muhtemelen GetMyCertificates veya get-my-certificates'tir.
  // Şimdilik standart PascalCase bırakıyorum, hata alırsan burayı da kontrol ederiz.
  getMyCertificates(): Observable<UserCertificateDto[]> {
    return this.http.get<any>(`${this.baseUrl}/UserCertificate/GetMyCertificates`).pipe(
      map(res => {
          const data = res.data || res.result || res.body;
          return Array.isArray(data) ? data : [];
      })
    );
  }
}