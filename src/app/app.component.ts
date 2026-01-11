import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    
    // Navbar ve Footer'ın GİZLENECEĞİ durumlar
    hideNavbar = false;
    hideFooter = false;

    constructor(public router: Router) {
        // Sayfa her değiştiğinde kontrol et
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            this.checkVisibility(event.url);
        });
    }

    ngOnInit() {
        // İlk açılışta da kontrol et
        this.checkVisibility(this.router.url);
    }

    checkVisibility(url: string) {
        // 1. Auth sayfaları (Login/Register) -> Hepsi gizli
        const isAuth = url.includes('/auth');

        // 2. Instructor Paneli -> Navbar gizlenebilir (isteğe bağlı)
        const isInstructor = url.includes('/instructor');

        // 3. Ders İzleme Ekranı (watch) -> Navbar gizli
        const isPlayer = url.includes('/watch');

        // Karar Ver:
        // Eğer Auth, Instructor veya Player sayfasındaysak Navbar'ı gizle
        this.hideNavbar = isAuth || isInstructor || isPlayer;
        
        // Footer da aynı mantıkla gizlensin
        this.hideFooter = isAuth || isInstructor || isPlayer;
    }
}