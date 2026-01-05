import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
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

    private getAuthFromLocalStorage(): Observable<any> {
        try {
            const lsValue = sessionStorage.getItem(this.authLocalStorageToken);
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
                // if (response.header.result) {
                //     response.body.message && this.toastr.success(response.body.message);
                //   } else {
                //     this.toastr.error(response.header.msg);
                //   }
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
                // if (response.header.result) {
                //     response.body.message && this.toastr.success(response.body.message);
                //   } else {
                //     this.toastr.error(response.header.msg);
                //   }
                return response;
            }),
            catchError((error: any) => {
                throw error;
            }),
            //finalize(() => this.isLoadingSubject.next(false))
        );
    }

    logout() {
        sessionStorage.removeItem(this.authLocalStorageToken);
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

    verify(userName: string, code: string): Observable<any> {
        this.isLoadingSubject.next(true);
        return this.userApiService.verifySignIn({ userName, code }).pipe(
            map((response: any) => {
                if (response.header.result) {
                    this.saveUserData(response.body, userName);
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

    saveUserData(userData: any, email: string) {
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

        sessionStorage.setItem(
            this.authLocalStorageToken,
            JSON.stringify(user)
        );
        this.currentUserSubject.next(user);
    }
}
