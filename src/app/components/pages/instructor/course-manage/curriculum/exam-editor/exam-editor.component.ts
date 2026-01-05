import { Component, Input } from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ExamApiService } from 'src/app/shared/api/exam-api.service';
import {
    CourseState,
    selectSelectedCourse,
} from 'src/app/shared/store/course.reducer';

@Component({
    selector: 'app-exam-editor',
    templateUrl: './exam-editor.component.html',
    styleUrls: ['./exam-editor.component.scss'],
})
export class ExamEditorComponent {
    private unsubscribe: Subscription[] = [];
    @Input() isEdit = false;
    @Input() examDetail: any;
    examForm!: FormGroup;
    newTopicFormVisible = false;
    trainingId!: number;

    constructor(
        private formBuilder: FormBuilder,
        public activeModal: NgbActiveModal,
        public examApiService: ExamApiService,
        private store: Store<{ course: CourseState }>
    ) {
        this.examForm = this.formBuilder.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            succesRate: [null, Validators.required],
            passingScore: [null, Validators.required],
            totalQuestionCount: [null, Validators.required],
            topics: this.formBuilder.array([]),
        });
    }
    get controls(): { [key: string]: AbstractControl } {
        return this.examForm.controls;
    }

    get topics(): FormArray {
        return this.examForm.controls['topics'] as FormArray;
    }

    ngOnInit(): void {
        if (this.isEdit && this.examDetail?.activeVersions) {
            const topicsArray = this.formBuilder.array(
                this.examDetail.activeVersions.topics.map((topic: any) => {
                    return this.formBuilder.group({
                        title: [topic.title, Validators.required],
                        questions: this.formBuilder.array(
                            topic.questions.map((q: any) =>
                                this.formBuilder.group({
                                    text: [q.text, Validators.required],
                                })
                            )
                        ),
                    });
                })
            );
    
            this.examForm.patchValue({
                title: this.examDetail.title,
                description: this.examDetail.description,
                succesRate: this.examDetail.activeVersions.succesRate,
                passingScore: this.examDetail.activeVersions.passingScore,
                totalQuestionCount: this.examDetail.activeVersions.totalQuestionCount,
            });
    
            this.examForm.setControl('topics', topicsArray);
        }
    
        const storeSubs = this.store.select(selectSelectedCourse).subscribe((val: any) => {
            this.trainingId = val.id;
        });
        this.unsubscribe.push(storeSubs);
    }
    

    addQuestion(topicIndex: number): void {
        const questionsArray = this.examForm.get('topics') as FormArray;
        const newQuestion = this.formBuilder.group({
            text: ['', Validators.required],
        });
        if (questionsArray) {
            const questionsControl = questionsArray
                .at(topicIndex)
                .get('questions') as FormArray;
            questionsControl.push(newQuestion);
        }
    }
    getQuestions(topicRef: any): FormArray {
        return topicRef.get('questions') as FormArray;
    }
    toggleNewTopicForm(): void {
        this.newTopicFormVisible = !this.newTopicFormVisible;
    }

    addTopic(): void {
        const addTopicSubs = this.examApiService
            .addExamTopic({
                examVersionId: this.examDetail.activeVersions.versionId,
                title: 'Test Topic',
                //questionCount: 10,
                imgPath: 'string',
                seqNumber: 1,
            })
            .subscribe((response) => {
                console.log(response);
                const topicsArray = this.examForm.get('topics') as FormArray;
                const newTopic = this.formBuilder.group({
                    title: ['', Validators.required],
                    questions: this.formBuilder.array([]),
                });
                topicsArray.push(newTopic);
            });
        this.unsubscribe.push(addTopicSubs);
    }

    submit(): void {
        this.examForm.markAllAsTouched();

        if (this.examForm.valid) {
            const requestPayload: any = {
                title: this.examForm.value.title,
                description: this.examForm.value.description,
                trainingId: this.trainingId,
                examStatusId: 1,
                actionId: 1, //sınavda başarısız olunca ne olacak
                updateData: 1,
                versionInfo: {
                    id: this.trainingId,
                    versionDescription: 'string',
                    examId: this.examDetail?.examId,
                    versionNumber: 1,
                    isPublished: false,
                    examTime: "00:30:00",
                    succesRate: this.examForm.value.succesRate,
                    passingScore: this.examForm.value.passingScore,
                    totalQuestionCount: this.examForm.value.totalQuestionCount,
                    statusId: 1,
                },
            };

            if (this.isEdit) {
                requestPayload.id = this.examDetail.examId;
            }

            const submitFormSubs = this.examApiService[
                this.isEdit ? 'updateExam' : 'addExam'
            ](requestPayload).subscribe((response) => {
                console.log(response);
            });
            this.unsubscribe.push(submitFormSubs);
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
