import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContentLibraryApiService {
  private baseUrl = environment.apiUrl + '/ContentLibrary'; 

  constructor(private http: HttpClient) { }

  getLibrary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetList`);
  }

  // // Yeni dosya yükleme (Create)
  // uploadFile(file: File): Observable<HttpEvent<any>> {
  //   const formData: FormData = new FormData();
  //   formData.append('file', file);

  //   const req = new HttpRequest('POST', `${this.baseUrl}/Upload`, formData, {
  //     reportProgress: true,
  //     responseType: 'json'
  //   });

  //   return this.http.request(req);
  // }

  // --- EKSİK OLAN METOT BU (EKLE BUNU) ---
  // Var olan bir kayda (ID) dosya basmak için (Retry/Repair)
  uploadMedia(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('file', file);

    // Backend Metodu: public async Task<Response<CommonResponse>> UploadMediaAsync(long id, IFormFile file)
    // Eğer backend'de metodun adı 'RetryUpload' ise URL'i ona göre güncelle.
    // Şimdilik standart UploadMedia varsayıyorum.
    return this.http.post<any>(`${this.baseUrl}/UploadFile`, formData);
  }
  // ----------------------------------------

  deleteFile(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/DeleteContent`, id); // Backend metod adını kontrol et (Delete vs DeleteContent)
  }

  updateContent(id: number, data: { title: string, description: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateContent`, { id, ...data });
  }

  addYoutubeContent(title: string, url: string, description: string): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + '/AddYoutubeContent',
      null, 
      {
        params: {
          title: title,
          url: url,
          description: description || '' 
        }
      }
    );
  }
}