import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TrainingCard } from '../models/training-card.model'; 

const API_TRAINING_URL = `${environment.apiUrl}/Training`;
const API_TRAINING_CATEGORY_URL = `${environment.apiUrl}/TrainingCategory`;
const API_TRAINING_CONTENT_URL = `${environment.apiUrl}/TrainingContent`;
const API_TRAINING_SECTION_URL = `${environment.apiUrl}/TrainingSection`;
const API_WHAT_YOU_WILL_LEARN_URL = `${environment.apiUrl}/WhatYouWillLearn`;

@Injectable({
  providedIn: 'root',
})
export class TrainingApiService {
  constructor(private http: HttpClient) {}

  getRecommendedTrainings(): Observable<TrainingCard> {
    return this.http.get<any>(`${API_TRAINING_URL}/get-recommended-trainings`);
  }

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

  // --- YENİ EKLENEN METOD (Navbar İçin) ---
  getNavbarRecentTrainings(count: number = 5): Observable<any> {
    const params = new HttpParams().set('count', count);
    return this.http.get<any>(`${API_TRAINING_URL}/GetNavbarRecentTrainings`, { params }).pipe(
        map(res => res.data || res.body || res)
    );
  }
}