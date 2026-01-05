import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { TypesApiService } from 'src/app/shared/api/types-api.service';

@Component({
    selector: 'app-course-details-page',
    templateUrl: './course-details-page.component.html',
    styleUrls: ['./course-details-page.component.scss']
})
export class CourseDetailsPageComponent {
    private unsubscribe: Subscription[] = [];

    trainingData: any;
    languageList: any[] = [];
    trainingLanguageName = 'Dil Bilgisi Yok';

    constructor(public trainingApiService: TrainingApiService,
        private route: ActivatedRoute,
        private typesService: TypesApiService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            const training$ = this.trainingApiService.getTrainingById(Number(id));
            const languages$ = this.typesService.getTypes('TrainingLanguage');

            const apiSubs = forkJoin([training$, languages$]).subscribe(([trainingRes, languages]) => {
                this.trainingData = trainingRes.body;
                this.languageList = languages;

                this.trainingLanguageName = this.getLanguageName(this.trainingData.trainingLanguageId);
            });

            this.unsubscribe.push(apiSubs);
        } else {
            this.router.navigate(['/']);
        }
    }

    getLanguageName(id: number): string {
        const language = this.languageList.find((lang: any) => lang.id === id);
        return language ? language.description : 'Dil Bilgisi Yok';
    }

    getLectureCount(section: any) {
        return section.trainingContents.filter((content: any) => content.contentType.code === 'lec').length;
    }

    getTotalLectureCount() {
        return this.trainingData?.trainingSections.reduce((total: number, section: any) => {
            return total + this.getLectureCount(section);
        }, 0);
    }

    // Video Popup
    isOpen = false;
    openPopup(): void {
        this.isOpen = true;
    }
    closePopup(): void {
        this.isOpen = false;
    }

    // Tabs
    currentTab = 'tab1';
    switchTab(event: MouseEvent, tab: string) {
        event.preventDefault();
        this.currentTab = tab;
    }

    // Accordion
    contentHeight: number = 0;
    openSectionIndex: number = -1;

    toggleSection(index: number): void {
        if (this.openSectionIndex === index) {
            this.openSectionIndex = -1;
        } else {
            this.openSectionIndex = index;
            this.calculateContentHeight();
        }
    }

    isSectionOpen(index: number): boolean {
        return this.openSectionIndex === index;
    }

    calculateContentHeight(): void {
        const contentElement = document.querySelector('.accordion-content');
        if (contentElement) {
            this.contentHeight = contentElement.scrollHeight;
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}