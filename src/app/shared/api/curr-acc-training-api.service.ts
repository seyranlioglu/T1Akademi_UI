import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// --- BACKEND STANDART RESPONSE YAPISI ---
export interface ResponseHeader {
  msgId: string;
  result: boolean; // Backend'deki 'result' alanı
  msg: string | null;
  resCode: number;
  dt: string;
}

export interface Response<T> {
  header: ResponseHeader;
  body: T; // Datalar 'body' içinde geliyor
}

export interface CommonResponse {
  header: ResponseHeader;
  // Post işlemlerinde bazen body boş dönebilir veya işlem sonucu dönebilir
  body?: any; 
}

// --- DTO TANIMLARI ---
export interface CompanyLibraryForAssignDto {
  currAccTrainingId: number;
  trainingId: number;
  trainingTitle: string;
  trainingImage?: string;
  paymentMethod: number;
  isUnlimited: boolean;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  quotaType: string;
  isCompanyOwned: boolean;
}

export interface CompanyUserAssignmentStatusDto {
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  title?: string;
  isAssigned: boolean;
  isActiveAssignment: boolean;
  accessEndDate?: Date;
  startDate?: Date;
  dueDate?: Date;
}

export interface AssignTrainingRequestDto {
  currAccTrainingId: number;
  userIds: number[];
  startDate?: Date;
  dueDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CurrAccTrainingApiService {
  
  private apiUrl = `${environment.apiUrl}/CurrAccTraining`;

  constructor(private http: HttpClient) { }

  /**
   * Kurum kütüphanesindeki eğitimleri ve kota bilgilerini getirir.
   * Endpoint: GET api/CurrAccTraining/company-library-for-assign
   */
  getCompanyLibraryForAssign(): Observable<Response<CompanyLibraryForAssignDto[]>> {
    return this.http.get<Response<CompanyLibraryForAssignDto[]>>(`${this.apiUrl}/company-library-for-assign`);
  }

  /**
   * Seçilen eğitime göre personellerin atama durumlarını getirir.
   * Endpoint: GET api/CurrAccTraining/company-users-assignment-status/{trainingId}
   */
  getCompanyUsersAssignmentStatus(trainingId: number): Observable<Response<CompanyUserAssignmentStatusDto[]>> {
    return this.http.get<Response<CompanyUserAssignmentStatusDto[]>>(`${this.apiUrl}/company-users-assignment-status/${trainingId}`);
  }

  /**
   * Personellere toplu eğitim ataması yapar.
   * Endpoint: POST api/CurrAccTraining/assign-training
   */
  assignTraining(data: AssignTrainingRequestDto): Observable<CommonResponse> {
    return this.http.post<CommonResponse>(`${this.apiUrl}/assign-training`, data);
  }
}