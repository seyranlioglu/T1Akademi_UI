import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { UserApiService } from 'src/app/shared/api/user-api.service';
import { NewCourseFormComponent } from './new-course-form/new-course-form.component';
import { GetTrainingListDto } from 'src/app/shared/models/GetTrainingListDto'; 

@Component({
    selector: 'app-courses',
    templateUrl: './courses.component.html',
    styleUrls: ['./courses.component.scss'],
})
export class CoursesComponent implements OnInit, OnDestroy {
    
    private unsubscribe: Subscription[] = [];
    formModalRef!: NgbModalRef;
    
    courseList: GetTrainingListDto[] = [];
    shownCourses: GetTrainingListDto[] = [];
    searchTerm: string = '';
    loading: boolean = false;

    constructor(
        public router: Router,
        public trainingApiService: TrainingApiService,
        public userApiService: UserApiService,
        private modalService: NgbModal
    ) { }

    ngOnInit(): void {
        this.loadCourses();
    }

    loadCourses() {
        this.loading = true;
        const apiSubs = this.trainingApiService.getInstructorTrainingList().subscribe({
            next: (response: any) => {
                // API yapısına göre data body içinde gelebilir
                let data: GetTrainingListDto[] = [];

                if (Array.isArray(response)) {
                    data = response;
                } else if (response && response.body && Array.isArray(response.body)) {
                    data = response.body;
                } else if (response && response.data && Array.isArray(response.data)) {
                    data = response.data;
                }

                this.courseList = data;
                this.shownCourses = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Eğitim listesi yüklenirken hata oluştu:', err);
                this.loading = false;
            }
        });
        this.unsubscribe.push(apiSubs);
    }

    searchCourses(): void {
        if (!this.searchTerm) {
            this.shownCourses = this.courseList;
            return;
        }
        const term = this.searchTerm.toLowerCase();
        this.shownCourses = this.courseList.filter((course) =>
            course.title && course.title.toLowerCase().includes(term)
        );
    }

    openNewCoursePopup(): void {
        this.formModalRef = this.modalService.open(NewCourseFormComponent, {
            size: 'lg',
            centered: true,
            backdrop: 'static'
        });

        this.formModalRef.result.then((result) => {
            if (result && result.success) {
                this.loadCourses();
            }
        }).catch(() => { });
    }

    redirectToCourseManage(course: any): void {
        if (course && course.id) {
            this.router.navigate(['/instructor/course-manage', course.id]);
        }
    }
    
    getCourseImage(path: string | null): string {
        if (!path || path === 'none' || path === 'null') {
            return 'assets/images/courses/TrainingDraft.png'; 
        }
        return path;
    }

    getProgressColor(rate: number): string {
        if (rate < 30) return 'bg-danger';
        if (rate < 80) return 'bg-warning';
        return 'bg-success';
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}