import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CourseState, selectSelectedCourse } from 'src/app/shared/store/course.reducer';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-instructor',
    templateUrl: './instructor.component.html',
    styleUrls: ['./instructor.component.scss'],
})
export class InstructorComponent implements OnInit, OnDestroy {
    private unsubscribe: Subscription[] = [];
    
    // YENİ EKLENEN DEĞİŞKENLER (Hataları çözecek olanlar)
    isSidebarCollapsed = false;  // Menü açık mı kapalı mı?
    isSmallScreen = false;       // Mobil mi?
    
    // Mevcut değişkenler (Gerekirse kalsın)
    currentCourse: any = null;

    constructor(
        public router: Router,
        private store: Store<{ course: CourseState }>
    ) {}

    // Ekran boyutu değişince tetiklenir
    @HostListener('window:resize', [])
    onResize(): void {
        this.checkScreenSize();
    }

    ngOnInit(): void {
        this.checkScreenSize();

        // Store'dan seçili kurs bilgisini al (Varsa kullanırız)
        const storeSubs = this.store
            .select(selectSelectedCourse)
            .subscribe((val) => {
                this.currentCourse = val;
            });
        this.unsubscribe.push(storeSubs);
    }

    // Ekran boyutuna göre mobil moduna geç
    private checkScreenSize(): void {
        this.isSmallScreen = window.innerWidth <= 992; // 992px altı mobil sayılır
        if (this.isSmallScreen) {
            this.isSidebarCollapsed = true; // Mobilde otomatik kapat
        } else {
            this.isSidebarCollapsed = false; // Masaüstünde aç
        }
    }

    // Sidebar aç/kapa
    toggleSidebar(): void {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}