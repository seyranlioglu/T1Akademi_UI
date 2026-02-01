import { createAction, props } from '@ngrx/store';

// 🔥 DÜZELTME: courseId tekrar optional (?) yapıldı. previewToken eklendi.
export const loadCourse = createAction(
  '[Course Page] Load Course',
  props<{ courseId?: number; previewToken?: string }>() 
);
export const loadCourseSuccess = createAction(
    '[Course] Load Course Success',
    props<{ selectedCourse: any }>()
);
export const loadCourseFailure = createAction(
    '[Course] Load Course Failure',
    props<{ error: string }>()
);

export const updateContentOrder = createAction(
    '[Course] Update Content Order',
    props<{ courseId?: number; contentOrderIds: any[] }>()
);

export const updateContentOrderSuccess = createAction(
    '[Course] Update Content Order Success',
    props<{ selectedCourse: any }>()
);
export const updateContentOrderFailure = createAction(
    '[Course] Update Content Order Failure',
    props<{ error: string }>()
);
