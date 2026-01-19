import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// DTO Tanımı
export interface CompanyDto {
    id: number;
    title: string;
    code: string;
    description?: string;
    taxNumber?: string;
    identityNumber?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CurrAccApiService {
    
    // Backend rotası
    private apiUrl = `${environment.apiUrl}/CurrAcc`;

    constructor(private http: HttpClient) { }

    /**
     * Firmaları (Cari Hesapları) Listeler
     * Endpoint: api/CurrAcc/GetCurrAccRecs?filterData=...
     */
    getCompanies(filterData: string = ''): Observable<CompanyDto[]> {
        let params = new HttpParams();
        
        // Eğer arama filtresi varsa query string'e ekle
        if (filterData) {
            params = params.set('filterData', filterData);
        }

        return this.http.get<any>(`${this.apiUrl}/GetCurrAccRecs`, { params })
            .pipe(
                map(res => {
                    // Backend standart Response yapısına göre datayı al
                    // { header: ..., body: [...] } veya { data: [...] }
                    return res.data || res.body || [];
                })
            );
    }
}