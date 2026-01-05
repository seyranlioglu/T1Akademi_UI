import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { UserApiService } from 'src/app/shared/api/user-api.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NewCourseFormComponent } from './new-course-form/new-course-form.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-courses',
    templateUrl: './courses.component.html',
    styleUrls: ['./courses.component.scss'],
})
export class CoursesComponent {
    private unsubscribe: Subscription[] = [];
    isHovered = false;
    formModalRef!: NgbModalRef;
    courseList: any = [];
    shownCourses: any = [];
    searchTerm: string = '';
    constructor(
        public router: Router,
        public trainingApiService: TrainingApiService,
        public userApiService: UserApiService,
        private modalService: NgbModal
    ) { }

    ngOnInit(): void {
        const apiSubs = this.trainingApiService.getTrainings().subscribe((response: any) => {
            console.log(response);
            if (response.body) {
                this.courseList = response.body;
                this.shownCourses = this.courseList;
            }
        });
        this.unsubscribe.push(apiSubs);
    }

    searchCourses(): void {
        this.shownCourses = this.courseList.filter((course: any) =>
            course.title.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    openNewCoursePopup(): void {
        this.formModalRef = this.modalService.open(NewCourseFormComponent, {
            size: 'lg',
        });
        this.formModalRef.result
            .then((result) => {
                this.modalService.dismissAll();
                if (result.success) {
                    // this.toastr.success(result.message);
                } else {
                    // this.toastr.error(result.message);
                }
            })
            .catch(() => { });
    }

    redirectToCourseManage(course: any): void {
        this.router.navigate(['/instructor/course-manage', course.id]);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
