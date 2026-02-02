import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContentLibraryApiService {
  private baseUrl = environment.apiUrl + '/ContentLibrary';

  constructor(private http: HttpClient) { }

  /**
   * Kütüphane içeriklerini sayfalı ve filtreli getirir.
   * Component tarafındaki çağrı: getList(page, size, search)
   */
  getList(page: number = 1, size: number = 12, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }
    
    // Backend'de genellikle metodun adı GetList olur ama route boş olabilir.
    // Eğer backend "[HttpGet]" ve route vermemişse direkt baseUrl'e atarız.
    // Garanti olsun diye /GetList ekliyorum, 404 alırsak burayı düzeltiriz.
    return this.http.get<any>(`${this.baseUrl}/GetList`, { params });
  }

  // Eski metot - Geriye dönük uyumluluk için parametresiz hali (Opsiyonel, gerekirse kalsın)
  getLibrary(): Observable<any> {
    return this.getList(1, 1000); // Hepsini getir gibi davranır
  }

  /**
   * Yeni dosya yükleme (Create)
   * @param file Yüklenecek dosya
   */
  uploadFile(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    // Backend: public async Task<Response<ContentLibraryDto>> UploadAsync(IFormFile file)
    return this.http.post<any>(`${this.baseUrl}/Upload`, formData);
  }

  /**
   * Var olan bir kayda (ID) dosya basmak için (Retry/Repair/Update Image)
   * @param id ContentLibrary Id
   * @param file Yeni dosya
   */
  uploadMedia(id: number | string, file: File): Observable<any> {
    const formData = new FormData();
    // Backend'deki parametre ismine dikkat: 'id' ve 'file'
    formData.append('id', id.toString());
    formData.append('file', file);

    return this.http.post<any>(`${this.baseUrl}/UploadMedia`, formData);
  }

  deleteFile(id: string): Observable<any> {
    // Backend: HttpDelete veya HttpPost olabilir. Genelde Delete işleminde ID url'den gider.
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  updateContent(id: string, data: { title: string, description: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/UpdateContent`, { id, ...data });
  }

  addYoutubeContent(title: string, url: string, description: string): Observable<any> {
    // Query string params yerine body kullanmak daha modern bir yaklaşımdır ama mevcut yapıya sadık kalıyoruz.
    let params = new HttpParams()
        .set('title', title)
        .set('url', url)
        .set('description', description || '');

    return this.http.post<any>(`${this.baseUrl}/AddYoutubeContent`, null, { params });
  }
}