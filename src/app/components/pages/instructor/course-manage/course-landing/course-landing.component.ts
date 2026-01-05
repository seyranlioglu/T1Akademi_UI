import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { TypesApiService } from 'src/app/shared/api/types-api.service';
import { CourseState, selectSelectedCourse } from 'src/app/shared/store/course.reducer';

@Component({
  selector: 'app-course-landing',
  templateUrl: './course-landing.component.html',
  styleUrls: ['./course-landing.component.scss']
})
export class CourseLandingComponent {
  private unsubscribe: Subscription[] = [];
  courseData: any;
  courseCategoryList: any[] = [];
  courseSubCategoryList: any[] = [];
  languageList: any[] = [];
  landingForm!: FormGroup;

  constructor(
    private store: Store<{ course: CourseState }>,
    public trainingApiService: TrainingApiService,
    private typesService: TypesApiService,
    private cdr: ChangeDetectorRef,
    public fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.landingForm = this.fb.group({
      title: [null, Validators.required],
      subTitle: [null],
      description: [null],
      trainingLanguageId: [null],
      categoryId: [null],
      subCategoryId: [null],
      courseImage: [null],
      trailer: [null],
      welcomeMessage: [null],
      congratulationMessage: [null]
    });

    const storeSubs = this.store
      .select(selectSelectedCourse)
      .subscribe((val) => {
        this.courseData = val;
        this.landingForm.patchValue({
          title: this.courseData.title,
          subTitle: this.courseData.subTitle,
          description: this.courseData.description,
          trainingLanguageId: this.courseData.trainingLanguageId || null,
          categoryId: this.courseData.categoryId,
          subCategoryId: this.courseData?.subCategoryId || null,
          courseImage: this.courseData.courseImage,
          trailer: this.courseData.trailer,
          welcomeMessage: this.courseData.welcomeMessage,
          congratulationMessage: this.courseData.congratulationMessage
        });
      });

    this.getTrainingCategories();
    this.getLanguageList();

    this.landingForm.get('categoryId')?.valueChanges.subscribe((categoryId) => {
      if (categoryId) {
        const selectedCategory = this.courseCategoryList.find(category => category.id === categoryId);
        if (selectedCategory) {
          this.courseSubCategoryList = selectedCategory.subCategories || [];
          this.cdr.detectChanges();
        }
      }
    });

    this.unsubscribe.push(storeSubs);
  }

  updateTraining(): void {
    const apiSubs = this.trainingApiService
      .updateTraining({ ...this.landingForm.value, id: this.courseData.id })
      .subscribe((response) => {

      });
    this.unsubscribe.push(apiSubs);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.landingForm.patchValue({ courseImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onVideoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.landingForm.patchValue({ trailer: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  getTrainingCategories(): void {
    this.trainingApiService
      .getTrainingCategories()
      .subscribe((response: any) => {
        if (response.body) {
          this.courseCategoryList = response.body
        }
      });
  }

  getLanguageList(): void {
    const apiSubs = this.typesService.getTypes('TrainingLanguage').subscribe((response) => {
      this.languageList = response;
      this.cdr.detectChanges();
    });

    this.unsubscribe.push(apiSubs);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}