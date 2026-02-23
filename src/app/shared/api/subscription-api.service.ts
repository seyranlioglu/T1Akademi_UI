import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionApiService {
  private apiUrl = `${environment.apiUrl}/Subscription`;

  constructor(private http: HttpClient) { }

  /**
   * Firma (B2B) ana sayfasında gösterilecek satın alınabilir paketler
   */
  getActivePlans(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/active-plans`).pipe(
      map(res => res.data || res.body || res)
    );
  }

  /**
   * Firmanın seçtiği paketi satın almak için talep oluşturması
   */
  createPurchaseRequest(dto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/purchase-request`, dto).pipe(
      map(res => res.data || res.body || res)
    );
  }

  /**
   * Firmanın mevcut "Aktif" aboneliğinin detaylarını (Kalan kredi, bitiş tarihi) görmesi
   */
  getMyActiveSubscription(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-active-subscription`).pipe(
      map(res => res.data || res.body || res)
    );
  }
}