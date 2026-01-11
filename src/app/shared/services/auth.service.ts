import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { UserApiService } from '../api/user-api.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private unsubscribe: Subscription[] = [];

    authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}-user`;
    isLoading$: Observable<boolean>;
    isLoadingSubject: BehaviorSubject<boolean>;
    currentUser$: Observable<any>;
    currentUserSubject: BehaviorSubject<any>;

    constructor(public userApiService: UserApiService, private router: Router) {
        this.currentUserSubject = new BehaviorSubject<any>(undefined);
        this.currentUser$ = this.currentUserSubject.asObservable();
        this.isLoadingSubject = new BehaviorSubject<boolean>(false);
        this.isLoading$ = this.isLoadingSubject.asObservable();
        const auth = this.getAuthFromLocalStorage().subscribe();
        this.unsubscribe.push(auth);
    }

    get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    set currentUserValue(user: any) {
        this.currentUserSubject.next(user);
    }

    // --- GÜNCELLENDİ: Hem Local hem Session Storage kontrolü ---
    private getAuthFromLocalStorage(): Observable<any> {
        try {
            // Önce LocalStorage (Kalıcı), Yoksa SessionStorage (Geçici) bak
            let lsValue = localStorage.getItem(this.authLocalStorageToken);
            if (!lsValue) {
                lsValue = sessionStorage.getItem(this.authLocalStorageToken);
            }

            if (!lsValue) {
                this.logout();
                return this.currentUser$;
            }

            const authData = JSON.parse(lsValue);
            this.currentUserSubject.next(authData);
            return of(authData);
        } catch (error) {
            console.error(error);
            return this.currentUser$;
        }
    }

    login(payload: any): Observable<any> {
        this.isLoadingSubject.next(true);
        return this.userApiService.signIn({ ...payload }).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                throw error;
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    register(payload: any): Observable<any> {
        this.isLoadingSubject.next(true);
        return this.userApiService.signUp({ ...payload }).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                throw error;
            })
        );
    }

    // --- GÜNCELLENDİ: Çıkış yaparken her iki yeri de temizle ---
    logout() {
        sessionStorage.removeItem(this.authLocalStorageToken);
        localStorage.removeItem(this.authLocalStorageToken);
        this.currentUserSubject.next(undefined);

        if (
            !window.location.pathname.includes('verify') &&
            !window.location.pathname.includes('register')
        ) {
            this.router.navigate(['/auth/login'], {
                queryParams: {},
            });
        }
    }

    forgotPassword(payload: any): Observable<any> {
        this.isLoadingSubject.next(true);
        return this.userApiService.forgotPassword(payload).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                throw error;
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    resetPassword(payload: any): Observable<any> {
        this.isLoadingSubject.next(true);
        return this.userApiService.resetPassword(payload).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                throw error;
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    // --- GÜNCELLENDİ: rememberMe parametresi eklendi ---
    verify(userName: string, code: string, rememberMe: boolean): Observable<any> {
        this.isLoadingSubject.next(true);
        // Not: userApiService.verifySignIn metodun değişmedi, sadece buradaki logic değişti
        return this.userApiService.verifySignIn({ userName, code }).pipe(
            map((response: any) => {
                if (response.header.result) {
                    // Kaydederken tercihi gönderiyoruz
                    this.saveUserData(response.body, userName, rememberMe);
                }
                return response;
            }),
            catchError((error: any) => {
                throw error;
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    verifyForgotPassword(userName: string, code: string): Observable<any> {
        this.isLoadingSubject.next(true);
        return this.userApiService.verifyForgotPassword({ userName, code }).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                throw error;
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    verifyCodeSend(payload: any): Observable<any> {
        this.isLoadingSubject.next(true);
        return this.userApiService.verifyCodeSend(payload).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                throw error;
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    verifyConfirm(payload: any): Observable<any> {
        this.isLoadingSubject.next(true);
        return this.userApiService.verifyConfirm(payload).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                throw error;
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    // --- GÜNCELLENDİ: rememberMe parametresi ve Storage seçimi ---
    saveUserData(userData: any, email: string, rememberMe: boolean = false) {
        const user: any = {
            id: userData.id,
            currAccId: userData.currAccId,
            instructorCode: userData.instructorCode,
            phoneNumber: userData.phoneNumber,
            accessToken: userData.token,
            refreshToken: userData.refreshToken,
            expiration: userData.expiration,
            name: userData.name,
            surname: userData.surName,
            shortName: userData.userShortName,
            email: email,
        };

        const userString = JSON.stringify(user);

        if (rememberMe) {
            // Beni Hatırla: LocalStorage (Kalıcı)
            localStorage.setItem(this.authLocalStorageToken, userString);
        } else {
            // Hatırlama: SessionStorage (Geçici)
            sessionStorage.setItem(this.authLocalStorageToken, userString);
        }

        this.currentUserSubject.next(user);
    }
}