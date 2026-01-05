import {
    CdkDragDrop,
    moveItemInArray,
    transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import {
    loadCourse,
    updateContentOrder,
} from 'src/app/shared/store/course.actions';
import {
    CourseState,
    selectSelectedCourse,
} from 'src/app/shared/store/course.reducer';
import { Utils } from 'src/app/shared/utils/utils';

@Component({
    selector: 'app-curriculum',
    templateUrl: './curriculum.component.html',
    styleUrls: ['./curriculum.component.scss'],
})
export class CurriculumComponent {
    private unsubscribe: Subscription[] = [];
    @Input() curriculumData: any;
    sections: any[] = [];
    newSectionTitle = '';
    isSectionFormVisible = false;
    trainingId: null | number = null;

    constructor(
        private store: Store<{ course: CourseState }>,
        private utils: Utils,
        public trainingApiService: TrainingApiService
    ) { }

    ngOnInit(): void {
        const storeSubs = this.store
            .select(selectSelectedCourse)
            .subscribe((val) => {
                if (val.trainingSections) {
                    this.sections = JSON.parse(
                        JSON.stringify(val.trainingSections)
                    );
                    this.trainingId = val.id;
                    this.utils.calculateCourseContentIndexes(this.sections);
                }
            });
        this.unsubscribe.push(storeSubs);
    }

    addSection(): void {
        const apiSubs = this.trainingApiService
            .addTrainingSection({
                title: this.newSectionTitle,
                trainingId: this.trainingId,
            })
            .subscribe((reponse) => {
                this.newSectionTitle = '';
                this.toggleSectionForm();
                this.store.dispatch(loadCourse({}));
            });

        this.unsubscribe.push(apiSubs);
    }

    toggleSectionForm(): void {
        this.isSectionFormVisible = !this.isSectionFormVisible;
    }

    onSectionDropped(event: CdkDragDrop<any>): void {
        moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
        this.store.dispatch(
            updateContentOrder({ contentOrderIds: this.getContentOrder() })
        );
        this.utils.calculateCourseContentIndexes(this.sections);
    }

    onContentDropped(event: CdkDragDrop<any>): void {
        const previousSectionIndex = this.getSectionIndexFromId(
            Number(event.previousContainer.element.nativeElement.id)
        );
        const currentSectionIndex = this.getSectionIndexFromId(
            Number(event.container.element.nativeElement.id)
        );

        if (previousSectionIndex === currentSectionIndex) {
            moveItemInArray(
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        }

        this.store.dispatch(
            updateContentOrder({ contentOrderIds: this.getContentOrder() })
        );
        this.utils.calculateCourseContentIndexes(this.sections);
    }

    getContentOrder() {
        return this.sections.map((section) => ({
            sectionId: section.trainingSectionId,
            contents: section.trainingContents.map((content: any) => ({
                contentId: content.id,
            })),
        }));
    }

    getSectionIndexFromId(id: number): number {
        return this.sections.findIndex(
            (section) => section.trainingSectionId === id
        );
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
