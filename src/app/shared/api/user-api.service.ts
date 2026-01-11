import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    

    // createUser(user: any): Observable<any> {
    //     return this.http.post<any>(this.apiUrl, user);
    // }

    // updateUser(id: number, user: any): Observable<any> {
    //     return this.http.put<any>(`${this.apiUrl}/${id}`, user);
    // }

    // deleteUser(id: number): Observable<void> {
    //     return this.http.delete<void>(`${this.apiUrl}/${id}`);
    // }
}
