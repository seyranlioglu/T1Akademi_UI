import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { 
  ContinueTrainingDto, 
  DashboardStatsDto, 
  TrainingCardDto, 
  UserCertificateDto // <-- YENİ: Model import edildi
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

  getContinueLearning(): Observable<ContinueTrainingDto | null> {
    return this.http.get<any>(`${this.dashboardUrl}/GetLastActiveTraining`).pipe(
      map(res => (res && res.header && res.header.result) ? res.body : null)
    );
  }

  getStats(): Observable<DashboardStatsDto | null> {
    return this.http.get<any>(`${this.dashboardUrl}/GetUserStats`).pipe(
      map(res => (res && res.header && res.header.result) ? res.body : null)
    );
  }

  getAssignedTrainings(): Observable<TrainingCardDto[]> {
    return this.http.get<any>(`${this.dashboardUrl}/GetAssignedTrainings`).pipe(
      map(res => (res && res.header && res.header.result) ? res.body : [])
    );
  }

  getRecommendedTrainings(): Observable<TrainingCardDto[]> {
    return this.http.get<any>(`${this.dashboardUrl}/GetRecommendedTrainings`).pipe(
      map(res => (res && res.header && res.header.result) ? res.body : [])
    );
  }

  getMyCertificates(): Observable<UserCertificateDto[]> {
    return this.http.get<any>(`${this.baseUrl}/UserCertificate/GetMyCertificates`).pipe(
      map(res => (res && res.header && res.header.result) ? res.body : [])
    );
  }
}