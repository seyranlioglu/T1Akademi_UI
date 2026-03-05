import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_CERT_URL = `${environment.apiUrl}/UserCertificate`;

@Injectable({
  providedIn: 'root'
})
export class CertificateApiService {
  constructor(private http: HttpClient) { }

  getMyCertificates(): Observable<any> {
    return this.http.get<any>(`${API_CERT_URL}/GetMyCertificates`);
  }
  
  // Gerekirse ileride doğrulama için:
  // verifyCertificate(id: string): Observable<any> {
  //   return this.http.get<any>(`${API_CERT_URL}/Verify/${id}`);
  // }
}