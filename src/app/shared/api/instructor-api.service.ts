import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InstructorApiService {
  private controllerUrl = `${environment.apiUrl}/Instructor`;

  constructor(private http: HttpClient) { }

  /**
   * Eğitmenlik başvurusu yapar.
   * Endpoint: POST api/Instructor/Apply
   */
  applyAsInstructor(data: any): Observable<any> {
    return this.http.post<any>(`${this.controllerUrl}/Apply`, data);
  }

  /**
   * Giriş yapmış kullanıcının eğitmen profilini getirir.
   * Endpoint: GET api/Instructor/GetMyProfile
   */
  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.controllerUrl}/GetMyProfile`);
  }

  /**
   * Eğitmen profilini günceller.
   * Endpoint: PUT api/Instructor/UpdateProfile
   */
  updateProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.controllerUrl}/UpdateProfile`, data);
  }

  /**
   * Belirli bir eğitmenin detaylarını getirir (Public/Vitrin).
   * Endpoint: GET api/Instructor/{id}
   */
  getInstructorById(instructorId: string): Observable<any> {
    return this.http.get<any>(`${this.controllerUrl}/${instructorId}`);
  }

  /**
   * Eğitmen listesini getirir (Filtreleme ile - Admin Panel).
   * Endpoint: GET api/Instructor
   */
  getInstructorsList(page: number = 1, size: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(`${this.controllerUrl}`, { params });
  }

  /**
   * Eğitmen başvurusunu onaylar (Admin paneli için).
   * Endpoint: PUT api/Instructor/Approve/{id}
   */
  approveInstructor(requestId: string): Observable<any> {
    // Backend'de RequestId beklediğimizi konuşmuştuk, endpoint ona göre olmalı
    // Veya InstructorManager proxy methoduna gider.
    return this.http.put<any>(`${this.controllerUrl}/Approve/${requestId}`, {});
  }

  // 🔥 YENİ EKLENEN: EĞİTMEN DURUM DEĞİŞTİRME (BAN HAMMER)
  changeInstructorStatus(instructorId: number, isActive: boolean, reason: string): Observable<any> {
    return this.http.post<any>(`${this.controllerUrl}/ChangeStatus`, { instructorId, isActive, reason });
  }
}