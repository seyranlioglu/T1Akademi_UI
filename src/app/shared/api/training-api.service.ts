import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TrainingCard } from '../models/dashboard.model'; 
import { SearchTrainingRequest, AddReviewDto } from '../models/training-list.model';

const API_TRAINING_URL = `${environment.apiUrl}/Training`; // Note: Controller name is usually plural 'Trainings' based on standard conventions, but I will stick to your existing constant logic or adjust specific calls. 
// However, looking at your provided code: const API_TRAINING_URL = `${environment.apiUrl}/Training`; 
// The previous backend controller code shared was: [Route("api/[controller]")] public class TrainingsController
// So the URL should ideally be .../Trainings. 
// I will use API_TRAINING_URL but ensure the endpoint matches the backend method name exactly.

const API_DASHBOARD_URL = `${environment.apiUrl}/Dashboard`; 
const API_TRAINING_CATEGORY_URL = `${environment.apiUrl}/TrainingCategory`;
const API_TRAINING_CONTENT_URL = `${environment.apiUrl}/TrainingContent`;
const API_TRAINING_SECTION_URL = `${environment.apiUrl}/TrainingSection`;
const API_WHAT_YOU_WILL_LEARN_URL = `${environment.apiUrl}/WhatYouWillLearn`;

@Injectable({
  providedIn: 'root',
})
export class TrainingApiService {
  constructor(private http: HttpClient) {}

  // ===========================================================================
  // DASHBOARD CONTROLLER 
  // ===========================================================================

  getRecommendedTrainings(): Observable<any> {
    return this.http.get<any>(`${API_DASHBOARD_URL}/recommended-trainings`).pipe(
        map(res => res.data || res.body || res) 
    );
  }

  getAssignedTrainings(): Observable<any> {
    return this.http.get<any>(`${API_DASHBOARD_URL}/assigned-trainings`).pipe(
      map(res => res.data || res.body || res)
    );
  }

  getLastActiveTraining(): Observable<any> {
    return this.http.get<any>(`${API_DASHBOARD_URL}/continue-learning`).pipe(
      map(res => res.data || res.body || res)
    );
  }

  getUserStats(): Observable<any> {
    return this.http.get<any>(`${API_DASHBOARD_URL}/stats`).pipe(
      map(res => res.data || res.body || res)
    );
  }

  // ===========================================================================
  // TRAINING CONTROLLER (Eğitim İşlemleri)
  // ===========================================================================

  // YENİ EKLENEN: Public Detay Sayfası için
  // Backend: [HttpGet("GetPublicDetail/{id}")]
  getTrainingPublicDetail(id: number): Observable<any> {
    return this.http.get<any>(`${API_TRAINING_URL}/GetPublicDetail/${id}`).pipe(
      map(res => res.data || res.body || res)
    );
  }

  getAdvancedList(request: SearchTrainingRequest): Observable<any> {
    let params = new HttpParams()
        .set('pageIndex', request.pageIndex.toString())
        .set('pageSize', request.pageSize.toString())
        .set('onlyPrivate', String(request.onlyPrivate));

    if (request.searchText) params = params.set('searchText', request.searchText);
    if (request.minRating) params = params.set('minRating', request.minRating.toString());
    // Yeni eklenen sıralama parametresi
    if (request.sortBy) params = params.set('sortBy', request.sortBy);

    if (request.categoryIds) {
        request.categoryIds.forEach(id => params = params.append('categoryIds', id.toString()));
    }
    if (request.levelIds) {
        request.levelIds.forEach(id => params = params.append('levelIds', id.toString()));
    }
    if (request.languageIds) {
        request.languageIds.forEach(id => params = params.append('languageIds', id.toString()));
    }
    if (request.instructorIds) {
        request.instructorIds.forEach(id => params = params.append('instructorIds', id.toString()));
    }

    return this.http.get<any>(`${API_TRAINING_URL}/GetAdvancedList`, { params }).pipe(
        map(res => res.body || res.data || res)
    );
  }

  getFilterOptions(): Observable<any> {
    return this.http.get<any>(`${API_TRAINING_URL}/GetFilterOptions`).pipe(
        map(res => res.body || res.data || res)
    );
  }

  getNavbarRecentTrainings(count: number = 5): Observable<any> {
    const params = new HttpParams().set('count', count);
    return this.http.get<any>(`${API_TRAINING_URL}/GetNavbarRecentTrainings`, { params }).pipe(
        map(res => res.data || res.body || res)
    );
  }

  toggleFavorite(trainingId: number): Observable<any> {
    return this.http.post<any>(`${API_TRAINING_URL}/toggle-favorite/${trainingId}`, {}).pipe(
      map(res => res.body || res.data || res)
    );
  }

  addReview(data: AddReviewDto): Observable<any> {
    return this.http.post<any>(`${API_TRAINING_URL}/add-review`, data).pipe(
      map(res => res.body || res.data || res)
    );
  }

  // ===========================================================================
  // CRUD METOTLARI
  // ===========================================================================

  addTraining(payload: any): Observable<any> {
    return this.http.post<any>(`${API_TRAINING_URL}/AddTraining`, payload);
  }

  updateTraining(payload: any): Observable<any> {
    return this.http.put<any>(`${API_TRAINING_URL}/UpdateTraining`, payload);
  }

  getTrainings(): Observable<any[]> {
    return this.http.get<any>(`${API_TRAINING_URL}/GetList`);
  }

  getTrainingById(id: number): Observable<any> {
    return this.http.get<any>(`${API_TRAINING_URL}/GetById?id=${id}`);
  }

  deleteTraining(id: number): Observable<any> {
    return this.http.delete<any>(`${API_TRAINING_URL}/DeleteTraining/${id}`);
  }

  // ... Category ...
  addTrainingCategory(payload: any): Observable<any> {
    return this.http.post<any>(`${API_TRAINING_CATEGORY_URL}/AddTrainingCategory`, payload);
  }

  updateTrainingCategory(payload: any): Observable<any> {
    return this.http.put<any>(`${API_TRAINING_CATEGORY_URL}/UpdateTrainingCategory`, payload);
  }

  getTrainingCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${API_TRAINING_CATEGORY_URL}/GetList`);
  }

  getTrainingCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${API_TRAINING_CATEGORY_URL}/GetById/${id}`);
  }

  deleteTrainingCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${API_TRAINING_CATEGORY_URL}/DeleteTrainingCategory/${id}`);
  }

  // ... Content ...
  addTrainingContent(payload: any): Observable<any> {
    return this.http.post<any>(`${API_TRAINING_CONTENT_URL}/AddTrainingContent`, payload);
  }

  updateTrainingContent(payload: any): Observable<any> {
    return this.http.put<any>(`${API_TRAINING_CONTENT_URL}/UpdateTrainingContent`, payload);
  }

  getTrainingContents(): Observable<any[]> {
    return this.http.get<any[]>(`${API_TRAINING_CONTENT_URL}/GetList`);
  }

  getTrainingContentById(id: number): Observable<any> {
    return this.http.get<any>(`${API_TRAINING_CONTENT_URL}/GetById/${id}`);
  }

  deleteTrainingContent(id: number): Observable<any> {
    return this.http.delete<any>(`${API_TRAINING_CONTENT_URL}/DeleteTrainingContent`, { body:  id  });
  }

  // ... Section ...
  addTrainingSection(payload: any): Observable<any> {
    return this.http.post<any>(`${API_TRAINING_SECTION_URL}/AddTrainingSection`, payload);
  }

  updateTrainingSection(payload: any): Observable<any> {
    return this.http.put<any>(`${API_TRAINING_SECTION_URL}/UpdateTrainingSection`, payload);
  }

  getTrainingSections(): Observable<any[]> {
    return this.http.get<any[]>(`${API_TRAINING_SECTION_URL}/GetList`);
  }

  getTrainingSectionById(id: number): Observable<any> {
    return this.http.get<any>(`${API_TRAINING_SECTION_URL}/GetById/${id}`);
  }

  deleteTrainingSection(id: number): Observable<any> {
    return this.http.delete<any>(`${API_TRAINING_SECTION_URL}/DeleteTrainingSection`, { body:  id  });
  }

  // ... WhatYouWillLearn ...
  addWhatYouWillLearn(payload: any): Observable<any> {
    return this.http.post<any>(`${API_WHAT_YOU_WILL_LEARN_URL}/AddWhatYouWillLearn`, payload);
  }
  
  updateWhatYouWillLearn(payload: any): Observable<any> {
    return this.http.put<any>(`${API_WHAT_YOU_WILL_LEARN_URL}/UpdateWhatYouWillLearn`, payload);
  }
  
  getWhatYouWillLearn(): Observable<any> {
    return this.http.get<any[]>(`${API_WHAT_YOU_WILL_LEARN_URL}/GetList`);
  }
  
  deleteWhatYouWillLearn(id: number): Observable<any> {
    return this.http.delete<any>(`${API_WHAT_YOU_WILL_LEARN_URL}/DeleteWhatYouWillLearn`, { body:  id  });
  }

  searchTrainings(term: string): Observable<any> {
    const params = new HttpParams().set('query', term);
    return this.http.get<any>(`${API_TRAINING_URL}/Search`, { params });
  }

  getTierPricing(priceTierId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Pricing/tier/${priceTierId}`).pipe(
        map(res => res.data || res.body || res)
    );
  }

  getInstructorTrainingList(): Observable<any> {
    // Backend Controller Endpoint: [HttpGet("GetMyTrainings")]
    return this.http.get<any>(`${API_TRAINING_URL}/GetInstructorTrainings`);
  }

  // 🔥 YENİ: İçerik Sıralama (Reorder)
  reorderContent(payload: any): Observable<any> {
    // Backend endpoint: api/Training/ReorderContent
    return this.http.put<any>(`${API_TRAINING_URL}/ReorderContent`, payload);
  }
}