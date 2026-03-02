import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // DİKKAT: Bunu ekle
import { environment } from 'src/environments/environment';

const API_USER_URL = `${environment.apiUrl}/User`;

@Injectable({
    providedIn: 'root',
})
export class UserApiService {
    constructor(private http: HttpClient) { }

    signIn(payload: any): Observable<any> {
        return this.http.post<any>(`${API_USER_URL}/SignIn`, payload);
    }
    verifySignIn(payload: any): Observable<any> {
        return this.http.post<any>(`${API_USER_URL}/VerifySignIn`, payload);
    }
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${API_USER_URL}/GetList`);
    }
    signUp(payload: any): Observable<any> {
        return this.http.post<any>(`${API_USER_URL}/SignUp`, payload);
    }
    getUserById(id: number): Observable<any> {
        return this.http.post<any>(`${API_USER_URL}/GetById/`, { id });
    }
    updateUser(payload: any): Observable<any> {
        return this.http.put<any>(`${API_USER_URL}/Update`, payload);
    }
    forgotPassword(payload: any): Observable<any> {
        return this.http.post<any>(`${API_USER_URL}/ForgotPassword`, payload);
    }
    verifyForgotPassword(payload: any): Observable<any> {
        return this.http.post<any>(`${API_USER_URL}/VerifyForgotPassword`, payload);
    }
    resetPassword(payload: any): Observable<any> {
        return this.http.post<any>(`${API_USER_URL}/ForgotPasswordReset`, payload);
    }
    verifyCodeSend(payload: any): Observable<any> {
        return this.http.post<any>(`${API_USER_URL}/VerifyCodeSend`, payload);
    }
    verifyConfirm(payload: any): Observable<any> {
        return this.http.post<any>(`${API_USER_URL}/VerifyConfirm`, payload);
    }

// YENİ METOD (FİLTRE DESTEKLİ POST)
  getManagedUsers(filterPayload: any = {}): Observable<any[]> {
      return this.http.post<any>(`${API_USER_URL}/managed-users`, filterPayload)
          .pipe(map(response => {
              // Backend'den { data: [...], isSuccessful: true } veya direkt liste dönebilir
              return response.data || response.body || response || [];
          }));
  }

addUser(payload: any): Observable<any> {
    return this.http.post<any>(`${API_USER_URL}/AddUser`, payload);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${API_USER_URL}/Delete/${id}`);
  }

  setUserStatus(userId: number, isActive: boolean): Observable<any> {
    // Backend'de SetStatus endpoint'i bir DTO bekliyorsa ona göre, 
    // yoksa query string veya anonim obje gönderebiliriz.
    // Senin backend: public async Task<Response<CommonResponse>> SetStatus([FromBody] SetUserStatusDto setUserStatusDto)
    // O yüzden bir obje gönderiyoruz:
    const payload = { userId: userId, isActive: isActive };
    return this.http.post<any>(`${API_USER_URL}/SetStatus`, payload);
  }

  // 🔥 YENİ EKLENEN METOT (INTERCEPTOR İÇİN)
    refreshToken(payload: any): Observable<any> {
        // Backend'deki AuthenticationService.CreateAccessTokenByRefreshToken metoduna denk gelen endpoint'i çağırır.
        // Endpoint adını (CreateAccessTokenByRefreshToken) backend controller'ına göre teyit et!
        return this.http.post<any>(`${API_USER_URL}/CreateAccessTokenByRefreshToken`, payload);
    }
}