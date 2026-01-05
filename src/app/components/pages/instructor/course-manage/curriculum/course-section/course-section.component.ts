import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { loadCourse } from 'src/app/shared/store/course.actions';
import { CourseState } from 'src/app/shared/store/course.reducer';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
@Component({
    selector: 'app-course-section',
    templateUrl: './course-section.component.html',
    styleUrls: ['./course-section.component.scss'],
})
export class CourseSectionComponent {
    private unsubscribe: Subscription[] = [];

    @Input() data: any;
    @Input() index: any; //TODO: remove when be is fixed
    @Input() cdkDropListConnectedTo: string[] = [];
    @Output() contentDropped = new EventEmitter<CdkDragDrop<any>>();

    formModalRef!: any;
    isTitleEditorVisible = false;
    isNewContentSelectorVisible = false;
    isNewContentFormVisible = false;
    newContentEditorTitle = '';
    newContentTitle = '';
    sectionTitle = '';
    selectedContentType: 'lecture' | 'exam' | null = null;

    constructor(
        private dialogService: DialogService,
        public trainingApiService: TrainingApiService,
        public modalService: NgbModal,
        private store: Store<{ course: CourseState }>
    ) {}

    toggleTitleEditor(): void {
        this.sectionTitle = '';
        this.isTitleEditorVisible = !this.isTitleEditorVisible;
    }

    toggleNewContentSelector() {
        this.isNewContentSelectorVisible = !this.isNewContentSelectorVisible;
    }

    addNewContent(): void {
        const formData = new FormData();

        formData.append('title', this.newContentTitle || '');
        formData.append(
            'trainingSectionId',
            this.data.trainingSectionId.toString()
        );
        formData.append(
            'contentTypeId',
            (this.selectedContentType === 'lecture' ? 21 : 20).toString() // TODO: use API for IDs
        );
        //formData.append('filePath', 'string');
        //formData.append('contentLibraryFilePath', 'string');
        //formData.append('contentLibraryFileName', 'string');

        const apiSubs = this.trainingApiService
            .addTrainingContent(formData)
            .subscribe((response) => {
                this.newContentTitle = '';
                this.store.dispatch(loadCourse({}));
            });

        this.unsubscribe.push(apiSubs);
    }

    toggleNewContentEditor(contentType?: 'lecture' | 'exam'): void {
        if (contentType === 'exam') {
            this.newContentEditorTitle = 'Yeni Sınav:';
            this.selectedContentType = 'exam';
        } else if (contentType === 'lecture') {
            this.newContentEditorTitle = 'Yeni Ders:';
            this.selectedContentType = 'lecture';
        }
        this.isNewContentFormVisible = !this.isNewContentFormVisible;
        this.newContentTitle = '';
        this.toggleNewContentSelector();
    }

    updateSection(): void {
        const apiSubs = this.trainingApiService
            .updateTrainingSection({
                id: this.data.trainingSectionId,
                title: this.sectionTitle,
            })
            .subscribe((response) => {
                this.sectionTitle = '';
                this.store.dispatch(loadCourse({}));
            });
        this.unsubscribe.push(apiSubs);
    }

    deleteSection(): void {
        this.dialogService.openDialog({
            headerText: 'Onay',
            bodyText: 'Silmek istediğinize emin misiniz?',
            confirmText: 'Tamam',
            cancelText: 'İptal',
            dialogConfirmed: () => {
                const apiSubs = this.trainingApiService
                    .deleteTrainingSection(this.data.trainingSectionId)
                    .subscribe((response) => {
                        if (response.body) {
                            this.store.dispatch(loadCourse({}));
                        }
                    });
                this.unsubscribe.push(apiSubs);
            },
        });
    }

    onContentDropped(event: CdkDragDrop<string[]>): void {
        this.contentDropped.emit(event);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
