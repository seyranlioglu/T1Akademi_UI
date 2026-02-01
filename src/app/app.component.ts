import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    
    hideNavbar = false;
    hideFooter = false;

    constructor(public router: Router) {}

    ngOnInit() {
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            this.checkVisibility(event.url);
        });
        this.checkVisibility(this.router.url);
    }

    checkVisibility(url: string) {
        const isAuth = url.includes('/auth');
        const isInstructor = url.includes('/instructor');
        
        // 🔥 GÜNCELLEME: '/watch' yerine veya ek olarak '/course-player' kontrolü
        const isPlayer = url.includes('/watch') || url.includes('/course-player');

        this.hideNavbar = isAuth || isInstructor || isPlayer;
        this.hideFooter = isAuth || isInstructor || isPlayer;
    }
}