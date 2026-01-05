import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { InactivityService } from './shared/services/inactivity.service';
import { AuthService } from './shared/services/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'Toledo - Angular 17 Online Courses & Education Template';

    showAuthFooter: boolean = false;
    showNavbar: boolean = false;
    isOnCoursePage: boolean = false;
    constructor(
        public router: Router,
        private inactivityService: InactivityService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        if (!this.authService.currentUserValue) {
            this.router.navigate(['/auth/login']);
        }

        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                const path = window.location.pathname;

                if (path.indexOf('/auth') > -1) {
                    this.showAuthFooter = true;
                    this.showNavbar = false;
                } else {
                    this.showAuthFooter = false;
                    this.showNavbar = true;
                }

                this.isOnCoursePage = path.indexOf('/watch') > -1;
            });

        this.inactivityService.$onInactive.subscribe(() => {
            const user = this.authService.currentUserValue;
            const isLoggedIn = user && user.accessToken;
            if (isLoggedIn) {
                //TODO: uncomment
                // this.authService.logout();
                // document.location.reload();
            }
        });
    }
}
