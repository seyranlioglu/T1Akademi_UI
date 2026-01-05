import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CourseState } from 'src/app/shared/store/course.reducer';
import { Store } from '@ngrx/store';
import { loadCourse } from 'src/app/shared/store/course.actions';

@Component({
    selector: 'app-course-manage',
    templateUrl: './course-manage.component.html',
    styleUrls: ['./course-manage.component.scss'],
})
export class CourseManageComponent {
    courseId!: number;

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        public trainingApiService: TrainingApiService,
        private store: Store<{ course: CourseState }>
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.courseId = params['id'];
            this.store.dispatch(loadCourse({ courseId: this.courseId }));
        });
    }
}
