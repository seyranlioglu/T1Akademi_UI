import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Eğer projede global bir Response interface'i varsa onu import etmeliyiz, 
// şimdilik inline veya any olarak generic tutuyorum ancak backend DTO'ları ile uyumludur.
// Normalde: import { Response } from '../models/response.model';

@Injectable({
  providedIn: 'root'
})
export class InstructorApiService {
  private controllerUrl = `${environment.apiUrl}/Instructor`;

  constructor(private http: HttpClient) { }

  /**
   * Eğitmenlik başvurusu yapar.
   * Backend: InstructorManager.ApplyAsInstructorAsync
   * @param data Başvuru formu verisi (Title, Bio, Resume vb.)
   */
  applyAsInstructor(data: any): Observable<any> {
    return this.http.post<any>(`${this.controllerUrl}/apply`, data);
  }

  /**
   * Giriş yapmış olan mevcut kullanıcının eğitmen profilini getirir.
   * Backend: InstructorManager.GetInstructorProfileAsync
   */
  getCurrentInstructorProfile(): Observable<any> {
    return this.http.get<any>(`${this.controllerUrl}/profile/current`);
  }

  /**
   * Belirli bir eğitmenin detaylarını getirir (Public/Vitrin).
   * Backend: InstructorManager.GetInstructorByIdAsync
   * @param instructorId Eğitmen ID'si
   */
  getInstructorById(instructorId: string): Observable<any> {
    return this.http.get<any>(`${this.controllerUrl}/${instructorId}`);
  }

  /**
   * Eğitmen listesini getirir (Filtreleme ile).
   * Backend: InstructorManager.GetInstructorListAsync
   * @param page Sayfa numarası
   * @param size Sayfa boyutu
   * @param search Arama kelimesi (opsiyonel)
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
   * Eğitmen profilini günceller.
   * Backend: InstructorManager.UpdateInstructorProfileAsync
   * @param data Güncellenecek veri (Dto)
   */
  updateInstructorProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.controllerUrl}/profile`, data);
  }

  /**
   * Eğitmen başvurusunu onaylar (Admin paneli için).
   * Backend: InstructorManager.ApproveInstructorAsync
   * @param instructorId Eğitmen ID
   */
  approveInstructor(instructorId: string): Observable<any> {
    return this.http.put<any>(`${this.controllerUrl}/approve/${instructorId}`, {});
  }

  /**
   * Eğitmenin hesap durumunu değiştirir (Aktif/Pasif).
   * Backend: InstructorManager.ChangeInstructorStatusAsync
   * @param instructorId Eğitmen ID
   * @param status Yeni durum (enum veya int)
   */
  changeInstructorStatus(instructorId: string, status: number): Observable<any> {
    return this.http.put<any>(`${this.controllerUrl}/status/${instructorId}`, { status });
  }
}