import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import {
    loadCourse,
    loadCourseFailure,
    loadCourseSuccess,
    updateContentOrder,
    updateContentOrderFailure,
    updateContentOrderSuccess,
} from './course.actions';
import { selectSelectedCourse } from './course.reducer';
import { TrainingApiService } from '../api/training-api.service';

@Injectable()
export class CourseEffects {
    constructor(
        private actions$: Actions,
        private store: Store,
        private trainingService: TrainingApiService
    ) {}

    loadCourse$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadCourse),
            withLatestFrom(this.store.select(selectSelectedCourse)),
            switchMap(([action, selectedCourse]) => {
                const courseId = action.courseId || selectedCourse?.id;

                if (!courseId) {
                    return of(
                        loadCourseFailure({
                            error: 'No course ID provided and no selected course found.',
                        })
                    );
                }

                return this.trainingService.getTrainingById(courseId).pipe(
                    map((response: any) =>
                        loadCourseSuccess({ selectedCourse: response.body })
                    ),
                    catchError((error) => of(loadCourseFailure({ error })))
                );
            })
        )
    );

    updateContentOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateContentOrder),
            withLatestFrom(this.store.select(selectSelectedCourse)),
            switchMap(([action, selectedCourse]) => {
                const courseId = action.courseId || selectedCourse?.id;

                if (!courseId) {
                    return of(
                        loadCourseFailure({
                            error: 'No course ID provided and no selected course found.',
                        })
                    );
                }

                const formData = new FormData();

                formData.append('id', courseId.toString());
                formData.append(
                    'contentOrderIds',
                    JSON.stringify(action.contentOrderIds)
                );

                return this.trainingService.updateTraining(formData).pipe(
                    switchMap((response: any) => [
                        updateContentOrderSuccess({ selectedCourse: response.body }),
                        loadCourse({ courseId })
                    ]),
                    catchError((error) =>
                        of(updateContentOrderFailure({ error }))
                    )
                );
            })
        )
    );
}
