import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PriceCampaignApiService {

  // Backend Controller İsimleri
  private pricingArea = 'Pricing';
  private campaignArea = 'Campaign'; // Controller adı 'CampaignController' olduğu için
  
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  // ==========================================================================
  // 1. PRICING (FİYATLANDIRMA) ENDPOINTS
  // ==========================================================================

  // [GET] Tüm Fiyat Kademelerini Getir
  getAllPriceTiers(activeOnly: boolean = true): Observable<any> {
    let params = new HttpParams().set('activeOnly', activeOnly);
    return this.http.get<any>(`${this.apiUrl}/${this.pricingArea}/tiers`, { params });
  }

  // [GET] Belirli bir Tier'ın detaylarını getir
  getPriceTierDetails(tierId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${this.pricingArea}/tier/${tierId}`);
  }

  // [GET] Abonelik Planlarını Getir
  getSubscriptionPlans(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${this.pricingArea}/plans`);
  }

  // ==========================================================================
  // 2. CAMPAIGN (KAMPANYA) ENDPOINTS
  // ==========================================================================

  // [GET] (Admin) Tüm Kampanyaları Listele
  getAllCampaigns(activeOnly: boolean = false): Observable<any> {
    let params = new HttpParams().set('activeOnly', activeOnly);
    return this.http.get<any>(`${this.apiUrl}/${this.campaignArea}`, { params });
  }

  // [GET] (Eğitmen) Katılabileceğim Kampanyalar
  getAvailableCampaigns(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${this.campaignArea}/opportunities`);
  }

  // [POST] (Eğitmen) Kampanyaya Katıl
  joinCampaign(payload: { campaignId: number, trainingId?: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${this.campaignArea}/join`, payload);
  }

  // [POST] (Eğitmen) Kampanyadan Ayrıl
  exitCampaign(campaignId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${this.campaignArea}/exit/${campaignId}`, {});
  }
}