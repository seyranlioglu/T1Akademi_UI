import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContentLibraryApiService {
  private baseUrl = environment.apiUrl + '/ContentLibrary'; // Controller ismini buraya yazacağız

  constructor(private http: HttpClient) { }

  // 1. Kütüphane Listesini Getir
  getLibrary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetList`);
  }

  // 2. Dosya Yükle (Progress Bar için 'reportProgress: true' önemli)
  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/Upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  // 3. Dosya Sil
  deleteFile(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/Delete`, id); // Backend post bekliyor olabilir, delete ise http.delete yap
  }

  updateContent(id: number, data: { title: string, description: string }): Observable<any> {
  return this.http.put(`${this.baseUrl}/Update`, { id, ...data });
}
}