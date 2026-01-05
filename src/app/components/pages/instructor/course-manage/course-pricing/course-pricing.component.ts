import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CourseState, selectSelectedCourse } from 'src/app/shared/store/course.reducer';

@Component({
  selector: 'app-course-pricing',
  templateUrl: './course-pricing.component.html',
  styleUrls: ['./course-pricing.component.scss']
})
export class CoursePricingComponent {
  private unsubscribe: Subscription[] = [];
  selectedPricingTier: any = null;
  trainingId: null | number = null;

  constructor(
    private store: Store<{ course: CourseState }>,
    public trainingApiService: TrainingApiService,
    public fb: FormBuilder
  ) { }

  ngOnInit(): void {
    const storeSubs = this.store
      .select(selectSelectedCourse)
      .subscribe((val) => {
        this.trainingId = val.id;
      });

    this.unsubscribe.push(storeSubs);
  }

  savePricingTier(): void {
    const apiSubs = this.trainingApiService
      .updateTraining({ priceTierId: this.selectedPricingTier, id: this.trainingId })
      .subscribe((response) => {

      });
    this.unsubscribe.push(apiSubs);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}