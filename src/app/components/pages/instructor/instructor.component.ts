import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    CourseState,
    selectSelectedCourse,
} from 'src/app/shared/store/course.reducer';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-instructor',
    templateUrl: './instructor.component.html',
    styleUrls: ['./instructor.component.scss'],
})
export class InstructorComponent implements OnInit {
    private unsubscribe: Subscription[] = [];
    isHovered = false;
    isSidebarOpen = false;
    isSmallScreen = false;
    currentCourse: any = null;
    constructor(
        public router: Router,
        private store: Store<{ course: CourseState }>
    ) {}

    @HostListener('window:resize', [])
    onResize(): void {
        this.checkScreenSize();
    }

    ngOnInit(): void {
        this.checkScreenSize();

        const storeSubs = this.store
            .select(selectSelectedCourse)
            .subscribe((val) => {
                this.currentCourse = val;
            });
        this.unsubscribe.push(storeSubs);
    }

    private checkScreenSize(): void {
        this.isSmallScreen = window.innerWidth <= 768;
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    closeSidebar(): void {
        if (this.isSmallScreen) {
            this.isSidebarOpen = false;
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
