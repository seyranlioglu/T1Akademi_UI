import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExamEditorComponent } from '../exam-editor/exam-editor.component';
import { ExamApiService } from 'src/app/shared/api/exam-api.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-exam-library',
    templateUrl: './exam-library.component.html',
    styleUrls: ['./exam-library.component.scss'],
})
export class ExamLibraryComponent {
    private unsubscribe: Subscription[] = [];
    @Output() close = new EventEmitter<any>();
    newExamForm!: FormGroup;
    examList: any[] = [];
    formModalRef!: any;
    constructor(
        public modalService: NgbModal,
        public examApiService: ExamApiService
    ) {}

    ngOnInit(): void {
        this.getAllExams();
    }
    openExamEditor(isEditMode: boolean, examDetail?: any): void {
        this.formModalRef = this.modalService.open(ExamEditorComponent, {
            size: isEditMode ? 'fullscreen' : 'lg',
        });
        if (isEditMode) {
            this.formModalRef.componentInstance.examDetail = examDetail;
        }
        this.formModalRef.componentInstance.isEdit = isEditMode;
        this.formModalRef.result
            .then((result: any) => {
                this.modalService.dismissAll();
                //  if (result.success) {
                //      // this.toastr.success(result.message);
                //  } else {
                //      // this.toastr.error(result.message);
                //  }
            })
            .catch(() => {});
    }

    getAllExams(): void {
        const submitFormSubs = this.examApiService
            .getAllExams({ isActive: true })
            .subscribe((response) => {
                if (response.body.exams) {
                    this.examList = response.body.exams;
                    console.log('got list', response.body.exams);
                }
            });
        this.unsubscribe.push(submitFormSubs);
    }

    editExam(examId: number): void {
        const examDetailSubs = this.examApiService
            .getExamDetail({ examId: examId })
            .subscribe((response) => {
                this.openExamEditor(true, { ...response.body, examId: examId });
            });
        this.unsubscribe.push(examDetailSubs);
    }

    submit(): void {}
}
