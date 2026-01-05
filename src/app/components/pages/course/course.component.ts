import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlyrComponent } from '@atom-platform/ngx-plyr';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { loadCourse } from 'src/app/shared/store/course.actions';
import {
    CourseState,
    selectSelectedCourse,
} from 'src/app/shared/store/course.reducer';
import { Utils } from 'src/app/shared/utils/utils';

@Component({
    selector: 'app-course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.scss'],
})
export class CourseComponent {
    private unsubscribe: Subscription[] = [];
    @ViewChild(PlyrComponent) player!: PlyrComponent;
    courseId!: number;
    currentCourse!: any;

    collapsedSections: { [key: number]: boolean } = {};

    watchedTime = 0;
    currentTime = 0;
    plyrOptions: any;
    videoSources: Plyr.Source[] = [
        {
            src: 'http://188.132.128.38:8081/deneme.mp4',
        },
    ];

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        public trainingApiService: TrainingApiService,
        private store: Store<{ course: CourseState }>,
        private utils: Utils
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.courseId = params['id'];
            this.store.dispatch(loadCourse({ courseId: this.courseId }));
        });

        const storeSubs = this.store
            .select(selectSelectedCourse)
            .subscribe((val) => {
                if (Object.keys(val).length > 0) {
                    this.currentCourse = JSON.parse(JSON.stringify(val));
                    this.initializeCollapsedSections();
                    this.utils.calculateCourseContentIndexes(
                        this.currentCourse.trainingSections
                    );
                }
            });
        this.unsubscribe.push(storeSubs);

        this.setPlyrOptions();
    }

    setPlyrOptions(): void {
        const that = this;
        this.plyrOptions = {
            listeners: {
                seek: function customSeekBehavior(event: any): boolean {
                    let newTime = that.getTargetTime(that.player.player, event);
                    if (newTime > that.watchedTime) {
                        event.preventDefault();

                        return false;
                    }
                    return true;
                },
            },
        };
    }

    getTargetTime(plyr: any, input: any): number {
        if (
            typeof input === 'object' &&
            (input.type === 'input' || input.type === 'change')
        ) {
            return (
                (input.target.value / input.target.max) * plyr.media.duration
            );
        }

        return Number(input);
    }

    onPlyrInit(player: Plyr) {
        player.on('timeupdate', (event: any) => {
            this.currentTime = player.currentTime;
            this.watchedTime = Math.floor(this.player.player.currentTime);
        });
    }

    initializeCollapsedSections(): void {
        this.collapsedSections = this.currentCourse?.trainingSections.reduce(
            (acc: { [x: string]: boolean }, _: any, index: number) => {
                acc[index] = index !== 0;
                return acc;
            },
            {} as { [key: number]: boolean }
        );
    }

    toggleSection(index: number, event: Event): void {
        event.stopPropagation();
        this.collapsedSections = {
            ...this.collapsedSections,
            [index]: !this.collapsedSections[index],
        };
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
