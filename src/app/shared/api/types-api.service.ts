import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_TYPE_URL = `${environment.apiUrl}/Type`;
const API_CATEGORY_URL = `${environment.apiUrl}/TrainingCategory`;

@Injectable({
  providedIn: 'root',
})
export class TypesApiService {
  constructor(private http: HttpClient) { }

  /**
   * Generic Type Getirici
   * Backend: TypeController -> GetList(string typeEntity, object requestData)
   * @param typeEntity Backend'deki Entity Class Adı (Örn: "TrainingLevel")
   */
  private getTypes(typeEntity: string): Observable<any> {
    // Body boş gidiyor {}, çünkü filtreleme yok, hepsini istiyoruz.
    return this.http.post<any>(`${API_TYPE_URL}/GetList?typeEntity=${typeEntity}`, {});
  }

  // --- Entity Bazlı Metodlar ---

  // Entity Adı: TrainingLanguage (Training.cs ilişkisine göre)
  getLanguages(): Observable<any> {
    return this.getTypes('TrainingLanguage');
  }

  // Entity Adı: TrainingLevel
  getLevels(): Observable<any> {
    return this.getTypes('TrainingLevel');
  }

  // Kategoriler için özel controller var, onu çağırıyoruz
  // Backend: TrainingCategoryController -> GetListAsync()
  getCategories(): Observable<any> {
    return this.http.get<any>(`${API_CATEGORY_URL}/GetList`);
  }
  
  // Fiyat Tipleri (Entity: PriceTier)
  getPriceTiers(): Observable<any> {
    return this.getTypes('PriceTier');
  }
}