import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import {
    FormGroup,
    FormBuilder,
    AbstractControl,
    Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';

@Component({
    selector: 'app-new-course-form',
    templateUrl: './new-course-form.component.html',
    styleUrls: ['./new-course-form.component.scss'],
})
export class NewCourseFormComponent implements OnDestroy {
    private unsubscribe: Subscription[] = [];

    newCourseForm: FormGroup;
    courseCategoryList: any[] = [];
    courseSubCategoryList: any[] = [];

    constructor(
        private formBuilder: FormBuilder,
        public activeModal: NgbActiveModal,
        public trainingApiService: TrainingApiService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {
        this.newCourseForm = this.formBuilder.group({
            title: [null, Validators.required],
            categoryId: [null, Validators.required],
            subCategoryId: [null, Validators.required],
        });
    }

    get controls(): { [key: string]: AbstractControl } {
        return this.newCourseForm.controls;
    }

    ngOnInit() {
        this.getCourseCategories();
        this.newCourseForm.get('categoryId')?.valueChanges.subscribe((categoryId) => {
            if (categoryId) {
              const selectedCategory = this.courseCategoryList.find(category => category.id === categoryId);
              if (selectedCategory) {
                this.courseSubCategoryList = selectedCategory.subCategories || [];
                this.cdr.detectChanges();
              }
            }
          });
    }

    getCourseCategories() {
        const apiSubs = this.trainingApiService
            .getTrainingCategories()
            .subscribe((response: any) => {
                if (response.body) {
                    this.courseCategoryList = response.body;
                    console.log(this.courseCategoryList);
                }
            });
        this.unsubscribe.push(apiSubs);
    }

    submit(): void {
        this.newCourseForm.markAllAsTouched();
        console.log(this.newCourseForm.value);
        if (this.newCourseForm.valid) {
            const submitCourseSubs = this.trainingApiService
                .addTraining({ ...this.newCourseForm.value })
                .subscribe((response) => {
                    //TODO:handle fail
                    if (response.body.id) {
                        this.router.navigate([
                            '/instructor/course-manage/' + response.body.id,
                        ]);
                    }

                    this.activeModal.close({
                        success: response.header.result,
                        message: response.header.msg,
                    });
                });
            this.unsubscribe.push(submitCourseSubs);
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
