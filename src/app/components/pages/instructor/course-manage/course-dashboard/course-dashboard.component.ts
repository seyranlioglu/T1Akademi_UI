import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { TrainingProcessService } from 'src/app/shared/api/training-process.service';
import { TrainingQualityScoreApiService } from 'src/app/shared/api/training-quality-score-api.service';
import { CourseState } from 'src/app/shared/store/course.reducer';

@Component({
  selector: 'app-course-dashboard',
  templateUrl: './course-dashboard.component.html',
  styleUrls: ['./course-dashboard.component.scss']
})
export class CourseDashboardComponent implements OnInit {

  courseId!: number;
  course: any = null;
  
  qualityScore: any = null;
  processHistory: any[] = [];
  
  isLoadingScore = false;
  isLoadingHistory = false;
  isCalculating = false;

  completionRate = 0;
  missingFields: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private store: Store<{ course: CourseState }>,
    private qualityApi: TrainingQualityScoreApiService,
    private processApi: TrainingProcessService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      if (params['id']) {
        this.courseId = +params['id'];
        this.loadExternalData();
      }
    });

    this.store.select(state => state.course).subscribe(state => {
      if (state.selectedCourse) {
        this.course = state.selectedCourse;
        this.calculateCompletion();
      }
    });
  }

  loadExternalData() {
    if (!this.courseId) return;
    this.loadQualityScore();
    this.loadHistory();
  }

  loadQualityScore() {
    this.isLoadingScore = true;
    this.qualityApi.getScore(this.courseId).subscribe({
      next: (res: any) => {
        this.isLoadingScore = false;
        if (res.header.result) this.qualityScore = res.body;
        else this.qualityScore = null;
      },
      error: () => this.isLoadingScore = false
    });
  }

  calculateScore() {
    if (!this.courseId) return;
    this.isCalculating = true;
    this.qualityApi.recalculateScore(this.courseId).subscribe({
      next: (res: any) => {
        this.isCalculating = false;
        if (res.header.result) {
          this.qualityScore = res.body;
          this.toastr.success("Puan başarıyla güncellendi.");
        }
      },
      error: () => {
        this.isCalculating = false;
        this.toastr.error("Hesaplama başarısız.");
      }
    });
  }

  loadHistory() {
    this.isLoadingHistory = true;
    this.processApi.getHistory(this.courseId).subscribe({
      next: (res: any) => {
        this.isLoadingHistory = false;
        if (res.header.result) this.processHistory = res.body;
      },
      error: () => this.isLoadingHistory = false
    });
  }

  calculateCompletion() {
    if (!this.course) return;
    let score = 0;
    this.missingFields = [];

    if (this.course.title) score += 10; else this.missingFields.push("Başlık");
    if (this.course.subTitle) score += 10; else this.missingFields.push("Alt Başlık");
    if (this.course.description && this.course.description.length > 50) score += 10; else this.missingFields.push("Detaylı Açıklama");
    if (this.course.headerImage) score += 10; else this.missingFields.push("Kapak Görseli");
    if (this.course.whatYouWillLearns?.length >= 4) score += 10; else this.missingFields.push("En az 4 Kazanım");
    
    if (this.course.trainingSections?.length > 0) {
        score += 10;
        const hasContent = this.course.trainingSections?.some((s: any) => s.trainingContents?.length > 0);
        if (hasContent) score += 30; else this.missingFields.push("Ders İçerikleri");
    } else {
        this.missingFields.push("Müfredat Bölümleri");
        this.missingFields.push("Ders İçerikleri");
    }

    if (this.course.priceTierId || this.course.amount) score += 10; else this.missingFields.push("Fiyatlandırma");
    this.completionRate = score;
  }
}