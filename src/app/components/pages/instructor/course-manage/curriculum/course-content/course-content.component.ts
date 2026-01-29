import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { loadCourse } from 'src/app/shared/store/course.actions';
import { CourseState } from 'src/app/shared/store/course.reducer';

@Component({
    selector: 'app-course-content',
    templateUrl: './course-content.component.html',
    styleUrls: ['./course-content.component.scss'],
})
export class CourseContentComponent {
    private unsubscribe: Subscription[] = [];
    @Input() data: any;
    isTitleEditorVisible = false;
    isExamLibraryVisible = false;
    isContentDetailsVisible = false;
    hasContent = false;
    contentTitle = '';

    constructor(
        private dialogService: DialogService,
        public trainingApiService: TrainingApiService,
        private store: Store<{ course: CourseState }>
    ) { }

    ngOnInit(): void {
        this.hasContent =
            this.data?.trainingContentLibraryDto?.trainingContentLibraryFileName !== null;
    }

    toggleContentDetails(): void {
        this.hideAll('contentDetails');
        this.isContentDetailsVisible = !this.isContentDetailsVisible;
    }

    toggleTitleEditor(): void {
        this.hideAll('titleEditor');
        this.isTitleEditorVisible = !this.isTitleEditorVisible;
        this.contentTitle = '';
    }
    toggleExamLibrary(): void {
        this.hideAll('examLibrary');
        this.isExamLibraryVisible = !this.isExamLibraryVisible;
    }

    hideAll(exception?: string): void {
        if (exception !== 'titleEditor') this.isTitleEditorVisible = false;
        if (exception !== 'examLibrary') this.isExamLibraryVisible = false;
        if (exception !== 'contentDetails')
            this.isContentDetailsVisible = false;
    }

    updateContent(): void {
        const formData = new FormData();

        formData.append('id', this.data.id.toString());
        formData.append('title', this.contentTitle || '');
        const apiSubs = this.trainingApiService
            .updateTrainingContent(formData)
            .subscribe((response) => {
                this.contentTitle = '';
                this.store.dispatch(loadCourse({}));
            });

        this.unsubscribe.push(apiSubs);
    }
    deleteContent(): void {
        this.dialogService.openDialog({
            headerText: 'Onay',
            bodyText: 'Silmek istediğinize emin misiniz?',
            confirmText: 'Tamam',
            cancelText: 'İptal',
            dialogConfirmed: () => {
                const apiSubs = this.trainingApiService
                    .deleteTrainingContent(this.data.id)
                    .subscribe((response) => {
                        if (response.body) {
                            this.store.dispatch(loadCourse({}));
                        }
                    });
                this.unsubscribe.push(apiSubs);
            },
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
