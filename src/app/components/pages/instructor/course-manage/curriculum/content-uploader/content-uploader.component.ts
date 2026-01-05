import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ElementRef,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { loadCourse } from 'src/app/shared/store/course.actions';
import { CourseState } from 'src/app/shared/store/course.reducer';

@Component({
    selector: 'app-content-uploader',
    templateUrl: './content-uploader.component.html',
    styleUrls: ['./content-uploader.component.scss'],
})
export class ContentUploaderComponent implements OnInit, OnDestroy {
    @Input() id!: number;
    @Output() close = new EventEmitter<any>();
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    state: 'select' | 'upload' = 'select';
    title = 'İçerik türünü seçin';
    file: File | null = null;

    private unsubscribe: Subscription[] = [];

    constructor(
        public trainingApiService: TrainingApiService,
        private store: Store<{ course: CourseState }>
    ) {}

    ngOnInit(): void {}

    onFileChanged(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.file = target.files?.[0] || null;
        console.log('Selected file:', this.file);
    }

    upload(): void {
        if (this.file && this.id) {
            const formData = new FormData();
            formData.append('id', this.id.toString());
            formData.append('file', this.file);

            const apiSubs = this.trainingApiService
                .updateTrainingContent(formData)
                .subscribe({
                    next: (response) => {
                        console.log('Upload successful:', response);
                        this.store.dispatch(loadCourse({}));
                        this.resetFileInput();
                        this.closeUploader();
                    },
                    error: (err) => {
                        console.error('Error uploading file:', err);
                    },
                });

            this.unsubscribe.push(apiSubs);
        }
    }

    showUploadForm(contentType: 'video' | 'pdf'): void {
        this.title = contentType === 'video' ? 'Video Ekle' : 'PDF Ekle';
        this.state = 'upload';
    }

    closeUploader(): void {
        this.resetFileInput();
        this.close.emit();
    }

    resetFileInput(): void {
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
        this.file = null;
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
