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

    // 🔥 GÜNCELLENEN LOAD COURSE EFFECT
    loadCourse$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadCourse),
            withLatestFrom(this.store.select(selectSelectedCourse)),
            switchMap(([action, selectedCourse]) => {
                // 1. ID Belirleme: Action'dan geleni al, yoksa Store'daki mevcut kursu kullan
                const courseId = action.courseId || selectedCourse?.id;

                if (!courseId) {
                    return of(
                        loadCourseFailure({
                            error: 'No course ID provided and no selected course found.',
                        })
                    );
                }

                // 2. Servis Çağrısı: previewToken'ı da gönderiyoruz
                return this.trainingService.getTrainingById(courseId, action.previewToken).pipe(
                    map((response: any) => {
                        // Backend Response<T> yapısına göre veriyi al
                        const data = response.data || response.body || response;
                        return loadCourseSuccess({ selectedCourse: data });
                    }),
                    catchError((error) => of(loadCourseFailure({ error })))
                );
            })
        )
    );

    // 🔥 MEVCUT UPDATE ORDER EFFECT (Aynı kalıyor ama sağlam olsun diye tekrar veriyorum)
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

                // FormData yerine JSON obje göndermek daha modern bir yaklaşım olabilir 
                // ama mevcut yapıyı bozmayalım.
                const payload = {
                    trainingId: courseId,
                    contentOrderIds: action.contentOrderIds
                };

                // Servis çağrısı (reorderContent metodunu daha önce eklemiştik)
                return this.trainingService.reorderContent(payload).pipe(
                    switchMap((response: any) => [
                        // Sıralama başarılı olunca...
                        // 1. Success action'ı fırlat (gerekirse)
                        updateContentOrderSuccess({ selectedCourse: response.body || response.data }),
                        // 2. Listeyi tazelemek için LoadCourse çağır
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