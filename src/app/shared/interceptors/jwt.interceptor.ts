import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserApiService } from '../api/user-api.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private _auth: AuthService, private userApi: UserApiService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        request = this.addTokenHeader(request);

        return next.handle(request).pipe(
            catchError(error => {
                // Hata 401 (Unauthorized) ise ve SignIn veya Refresh işlemlerinden gelmiyorsa
                if (error instanceof HttpErrorResponse && error.status === 401 && !request.url.includes('SignIn') && !request.url.includes('RefreshToken')) {
                    return this.handle401Error(request, next);
                }
                return throwError(() => error);
            })
        );
    }

    private addTokenHeader(request: HttpRequest<any>) {
        const user = this._auth.currentUserValue;
        const token = user?.accessToken || user?.token;
        const isApiUrl = request.url.startsWith(environment.apiUrl);

        if (token && isApiUrl) {
            return request.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            });
        }
        return request;
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            const user = this._auth.currentUserValue;
            const refreshTokenStr = user?.refreshToken;

            if (refreshTokenStr) {
                // Backend'in beklediği DTO yapısına göre objeyi yolluyoruz
                const payload = { refreshToken: refreshTokenStr };

                return this.userApi.refreshToken(payload).pipe(
                    switchMap((res: any) => {
                        this.isRefreshing = false;
                        
                        // Backend'den dönen cevabı yakala (Senin mimarinde genelde res.data veya res.body içindedir)
                        const newTokens = res.data || res.body || res;
                        
                        if (!newTokens) {
                            throw new Error("Token dönmedi");
                        }

                        // Local/Session storage ve currentUser subject güncelleniyor
                        this._auth.updateTokens(newTokens); 
                        
                        const newAccessToken = newTokens.token || newTokens.accessToken;
                        this.refreshTokenSubject.next(newAccessToken);

                        // Orijinal patlayan isteği YENİ TOKEN ile tekrar çalıştır
                        return next.handle(this.addTokenHeader(request));
                    }),
                    catchError((err) => {
                        this.isRefreshing = false;
                        this._auth.logout(); 
                        return throwError(() => err);
                    })
                );
            } else {
                this.isRefreshing = false;
                this._auth.logout();
                return throwError(() => new Error('Refresh token bulunamadı.'));
            }
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(jwt => {
                    return next.handle(this.addTokenHeader(request));
                })
            );
        }
    }
}