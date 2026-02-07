import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_LOG_URL = `${environment.apiUrl}/ContentLogAudit`; // Backend Controller Route'u

@Injectable({
  providedIn: 'root',
})
export class LogApiService {

  constructor(private http: HttpClient) {}

  // ===========================================================================
  // 1. OPERASYONEL (PLAYER) İŞLEMLERİ
  // ===========================================================================

  /**
   * Video izlenirken periyodik olarak (Heartbeat) veya aksiyonlarda (Pause/Seek) çağrılır.
   * Resume kaydını günceller ve Audit logu atar.
   * * Payload Örneği:
   * {
   * trainingContentId: 105,
   * currentSecond: 45,
   * totalDuration: 600,
   * action: 'Heartbeat' | 'Pause' | 'Seek' | 'Complete',
   * seekFrom: 30 (Sadece Seek işleminde)
   * }
   */
  logProgress(payload: any): Observable<any> {
    return this.http.post<any>(`${API_LOG_URL}/log-progress`, payload).pipe(
      map(res => res.data || res.body || res)
    );
  }

  /**
   * Beacon API ile Tarayıcı Kapanırken Log Atma (Fire and Forget)
   * HTTP Client kullanmaz, çünkü sayfa kapanırken HTTP istekleri iptal olabilir.
   * Bu metot Observable dönmez, çünkü cevabı beklemeyiz.
   */
  logProgressBeacon(payload: any): void {
    const url = `${API_LOG_URL}/log-progress`;
    
    // Beacon API JSON desteklemediği için Blob kullanıyoruz
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, blob);
    } else {
      // Fallback: Eski tarayıcılar için senkron XHR (Tavsiye edilmez ama gerekirse)
      // fetch(url, { method: 'POST', body: JSON.stringify(payload), keepalive: true });
    }
  }

  /**
   * Belirli bir içeriğin kullanıcısı için son durumunu çeker.
   * Player ilk açıldığında "Nerede kalmıştım?" sorusunun cevabıdır.
   */
  getUserContentState(contentId: number): Observable<any> {
    return this.http.get<any>(`${API_LOG_URL}/content-state/${contentId}`).pipe(
      map(res => res.data || res.body || res)
    );
  }

  // ===========================================================================
  // 2. YÖNETİM İŞLEMLERİ
  // ===========================================================================

  /**
   * Kullanıcının bir dersteki ilerlemesini sıfırlar. "Başa dön" butonu için.
   */
  resetProgress(contentId: number): Observable<any> {
    return this.http.post<any>(`${API_LOG_URL}/reset-progress/${contentId}`, {}).pipe(
      map(res => res.data || res.body || res)
    );
  }

  /**
   * Bir içeriği manuel olarak "Tamamlandı" işaretler.
   */
  markCompleted(contentId: number): Observable<any> {
    return this.http.post<any>(`${API_LOG_URL}/mark-completed/${contentId}`, {}).pipe(
      map(res => res.data || res.body || res)
    );
  }

  // ===========================================================================
  // 3. RAPORLAMA İŞLEMLERİ
  // ===========================================================================

  /**
   * Bir içeriğin izlenme tarihçesini (Logları) getirir.
   */
  getHistory(contentId: number, userId?: number): Observable<any[]> {
    let url = `${API_LOG_URL}/history/${contentId}`;
    if (userId) url += `?userId=${userId}`;
    
    return this.http.get<any>(url).pipe(
      map(res => res.data || res.body || res)
    );
  }

  /**
   * Bir eğitimin genelindeki izleme istatistiklerini getirir.
   */
  getStats(trainingId: number): Observable<any> {
    return this.http.get<any>(`${API_LOG_URL}/stats/${trainingId}`).pipe(
      map(res => res.data || res.body || res)
    );
  }
}