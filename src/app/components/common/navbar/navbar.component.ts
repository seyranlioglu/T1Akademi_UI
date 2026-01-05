import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, mergeMap } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
    showNavbar: boolean = true;
    // Navbar Sticky
    isSticky: boolean = false;
    classApplied = false;
    searchClassApplied = false;
    sidebarClassApplied = false;
    userMenuVisible: boolean = false;
    isInstructor: boolean = false;
    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition =
            window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;
        if (scrollPosition >= 70) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    constructor(
        public router: Router,
        private activatedRoute: ActivatedRoute,
        public authService: AuthService,
    ) { }

    ngOnInit() {
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                let currentRoute = this.activatedRoute;

                while (currentRoute.firstChild) {
                    currentRoute = currentRoute.firstChild;
                }

                currentRoute.data.subscribe((data) => {
                    this.showToolbar(data['toolbar']);
                });
            });

        this.authService.currentUser$.subscribe((user) => {
            if (user) {
                this.isInstructor = Boolean(user.instructorCode);
            }
        });

    }

    showToolbar(event: any) {
        if (event === false) {
            this.showNavbar = false;
        } else if (event === true || event === undefined) {
            this.showNavbar = true;
        } else {
            this.showNavbar = this.showNavbar;
        }
    }

    toggleClass() {
        this.classApplied = !this.classApplied;
    }

    toggleSearchClass() {
        this.searchClassApplied = !this.searchClassApplied;
    }

    toggleSidebarClass() {
        this.sidebarClassApplied = !this.sidebarClassApplied;
    }
    toggleUserMenu() {
        this.userMenuVisible = !this.userMenuVisible;
    }
}
