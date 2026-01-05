import {
    createFeatureSelector,
    createReducer,
    createSelector,
    on,
} from '@ngrx/store';
import {
    loadCourse,
    loadCourseFailure,
    loadCourseSuccess,
} from './course.actions';

export interface CourseState {
    selectedCourse: any;
    loading: boolean;
}

export const initialState: CourseState = {
    selectedCourse: {},
    loading: false,
};

export const courseReducer = createReducer(
    initialState,
    on(loadCourse, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(loadCourseSuccess, (state, { selectedCourse }) => ({
        ...state,
        selectedCourse,
        loading: false,

        error: null,
    })),
    on(loadCourseFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    }))
);

export const selectCourseState = createFeatureSelector<CourseState>('course');

export const selectSelectedCourse = createSelector(
    selectCourseState,
    (state: CourseState) => state.selectedCourse
);

export const selectLoading = createSelector(
    selectCourseState,
    (state: CourseState) => state.loading
);
