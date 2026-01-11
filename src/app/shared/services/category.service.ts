import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // API URL'i buradan alacağız
import { ApiResponse, TrainingCategory } from '../models/training-category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  // environment.ts dosyasında apiUrl tanımlı olmalı (örn: https://localhost:7001/api)
  private apiUrl = environment.apiUrl + '/TrainingCategory';

  constructor(private http: HttpClient) { }

  // Kategorileri Getir
  getCategories(): Observable<ApiResponse<TrainingCategory[]>> {
    return this.http.get<ApiResponse<TrainingCategory[]>>(`${this.apiUrl}/GetList`);
  }
}