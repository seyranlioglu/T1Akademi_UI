import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TrainingCard } from '../models/dashboard.model'; // DİKKAT: dashboard.model.ts'den import edildi
import { SearchTrainingRequest, AddReviewDto } from '../models/training-list.model';

const API_TRAINING_URL = `${environment.apiUrl}/Training`;
const API_DASHBOARD_URL = `${environment.apiUrl}/Dashboard`; // Dashboard Controller için
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
  // DASHBOARD CONTROLLER (Yeni Endpointler)
  // ===========================================================================

  // Backend: [HttpGet("recommended-trainings")]
  getRecommendedTrainings(): Observable<any> {
    return this.http.get<any>(`${API_DASHBOARD_URL}/recommended-trainings`).pipe(
        map(res => res.data || res.body || res) 
    );
  }

  // Backend: [HttpGet("assigned-trainings")]
  getAssignedTrainings(): Observable<any> {
    return this.http.get<any>(`${API_DASHBOARD_URL}/assigned-trainings`).pipe(
      map(res => res.data || res.body || res)
    );
  }

  // Backend: [HttpGet("continue-learning")]
  getLastActiveTraining(): Observable<any> {
    return this.http.get<any>(`${API_DASHBOARD_URL}/continue-learning`).pipe(
      map(res => res.data || res.body || res)
    );
  }

  // Backend: [HttpGet("stats")]
  getUserStats(): Observable<any> {
    return this.http.get<any>(`${API_DASHBOARD_URL}/stats`).pipe(
      map(res => res.data || res.body || res)
    );
  }

  // ===========================================================================
  // TRAINING CONTROLLER (Eğitim İşlemleri)
  // ===========================================================================

  // Backend: [HttpGet("GetAdvancedList")] -> [FromQuery]
  getAdvancedList(request: SearchTrainingRequest): Observable<any> {
    // GET isteği olduğu için parametreleri Query String'e çeviriyoruz
    let params = new HttpParams()
        .set('pageIndex', request.pageIndex.toString())
        .set('pageSize', request.pageSize.toString())
        .set('onlyPrivate', String(request.onlyPrivate));

    if (request.searchText) params = params.set('searchText', request.searchText);
    if (request.minRating) params = params.set('minRating', request.minRating.toString());

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

  // Backend: [HttpGet("GetFilterOptions")]
  getFilterOptions(): Observable<any> {
    return this.http.get<any>(`${API_TRAINING_URL}/GetFilterOptions`).pipe(
        map(res => res.body || res.data || res)
    );
  }

  // Backend: [HttpGet("GetNavbarRecentTrainings")]
  getNavbarRecentTrainings(count: number = 5): Observable<any> {
    const params = new HttpParams().set('count', count);
    return this.http.get<any>(`${API_TRAINING_URL}/GetNavbarRecentTrainings`, { params }).pipe(
        map(res => res.data || res.body || res)
    );
  }

  // Backend: [HttpPost("toggle-favorite/{id}")]
  toggleFavorite(trainingId: number): Observable<any> {
    return this.http.post<any>(`${API_TRAINING_URL}/toggle-favorite/${trainingId}`, {}).pipe(
      map(res => res.body || res.data || res)
    );
  }

  // Backend: [HttpPost("add-review")]
  addReview(data: AddReviewDto): Observable<any> {
    return this.http.post<any>(`${API_TRAINING_URL}/add-review`, data).pipe(
      map(res => res.body || res.data || res)
    );
  }

  // ===========================================================================
  // CRUD METOTLARI (Aynen Korundu)
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
  // Controller'da path'i değiştirdik: pricing/tier/{id}/details
  return this.http.get<any>(`${environment.apiUrl}/Pricing/tier/${priceTierId}`).pipe(
      map(res => res.data || res.body || res)
  );
}
}