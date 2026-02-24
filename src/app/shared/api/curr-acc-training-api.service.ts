import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// --- GENEL TİPLER ---
export interface Response<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface CommonResponse {
  result: boolean;
  message: string;
}

// --- DTO TİPLERİ ---
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
  
  // Backend rotası (Dün yazdığımız Controller)
  private apiUrl = `${environment.apiUrl}/CurrAccTraining`;

  constructor(private http: HttpClient) { }

  /**
   * MainUser'ın atama yapabileceği aktif kütüphane eğitimlerini getirir.
   */
  getCompanyLibraryForAssign(): Observable<Response<CompanyLibraryForAssignDto[]>> {
    return this.http.get<Response<CompanyLibraryForAssignDto[]>>(`${this.apiUrl}/company-library-for-assign`);
  }

  /**
   * Seçilen eğitime göre personellerin listesini ve atanma durumlarını getirir.
   */
  getCompanyUsersAssignmentStatus(trainingId: number): Observable<Response<CompanyUserAssignmentStatusDto[]>> {
    return this.http.get<Response<CompanyUserAssignmentStatusDto[]>>(`${this.apiUrl}/company-users-assignment-status/${trainingId}`);
  }

  /**
   * Atama işlemini (POST) gerçekleştirir.
   */
  assignTraining(data: AssignTrainingRequestDto): Observable<CommonResponse> {
    return this.http.post<CommonResponse>(`${this.apiUrl}/assign-training`, data);
  }
}