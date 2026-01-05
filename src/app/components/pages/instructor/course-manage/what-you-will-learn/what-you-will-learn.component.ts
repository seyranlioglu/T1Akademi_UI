import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { loadCourse } from 'src/app/shared/store/course.actions';
import { CourseState, selectSelectedCourse } from 'src/app/shared/store/course.reducer';
import { Utils } from 'src/app/shared/utils/utils';

@Component({
  selector: 'app-what-you-will-learn',
  templateUrl: './what-you-will-learn.component.html',
  styleUrls: ['./what-you-will-learn.component.scss']
})
export class WhatYouWillLearnComponent {
  private unsubscribe: Subscription[] = [];
  trainingId: null | number = null;
  whatYouWillLearnList: any[] = [];
  newWhatYouWillLearnItem = '';
  isWhatYouWillLearnFormVisible = false;

  constructor(
    private store: Store<{ course: CourseState }>,
    private utils: Utils,
    public trainingApiService: TrainingApiService
  ) { }

  ngOnInit(): void {
    const storeSubs = this.store
      .select(selectSelectedCourse)
      .subscribe((val) => {
        this.trainingId = val.id;
        this.whatYouWillLearnList = val.whatYouWillLearns.map((item: any) => ({
          ...item,
          isEditing: false
        }));

      });

    this.unsubscribe.push(storeSubs);
  }

  addWhatYouWillLearn(): void {
    if (!this.newWhatYouWillLearnItem) return;

    const apiSubs = this.trainingApiService
      .addWhatYouWillLearn({
        isActive: true,
        title: this.newWhatYouWillLearnItem,
        abbreviation: null,
        code: null,
        description: null,
        trainingId: this.trainingId,
      })
      .subscribe(() => {
        this.newWhatYouWillLearnItem = '';
        this.store.dispatch(loadCourse({ courseId: this.trainingId || undefined }));
        this.toggleWhatYouWillLearnForm();
      });

    this.unsubscribe.push(apiSubs);
  }

  updateWhatYouWillLearn(learningItem: any): void {

    const { whatYouWillLearnId, whatYouWillLearnTitle } = learningItem;
    if (!whatYouWillLearnTitle) return;

   
    learningItem.isEditing = false;


    const apiSubs = this.trainingApiService
      .updateWhatYouWillLearn({
        id:whatYouWillLearnId,
        title:whatYouWillLearnTitle,
        isActive: true,
        abbreviation: null,
        code: null,
        description: null,
        trainingId: this.trainingId,
      })
      .subscribe(() => {

        this.store.dispatch(loadCourse({ courseId: this.trainingId || undefined }));
      });

    this.unsubscribe.push(apiSubs);
  }

  deleteWhatYouWillLearn(id: number): void {
    const apiSubs = this.trainingApiService
      .deleteWhatYouWillLearn(id)
      .subscribe(() => {
        this.store.dispatch(loadCourse({ courseId: this.trainingId || undefined }));
      });

    this.unsubscribe.push(apiSubs);
  }

  toggleWhatYouWillLearnForm(): void {
    this.isWhatYouWillLearnFormVisible = !this.isWhatYouWillLearnFormVisible;
  }
  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}