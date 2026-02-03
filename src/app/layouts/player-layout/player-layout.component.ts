import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { PublicCourseDetail, PublicContent } from 'src/app/shared/models/public-course-detail.model';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-player-layout',
  templateUrl: './player-layout.component.html',
  styleUrls: ['./player-layout.component.scss']
})
export class PlayerLayoutComponent implements OnInit {

  courseId!: number;
  previewToken: string | null = null;
  
  course: PublicCourseDetail | null = null;
  activeContent: PublicContent | null = null;
  
  isLoading: boolean = true;
  isSidebarOpen: boolean = true; // Sidebar aç/kapa durumu

  // Sekmeler için aktif tab
  activeTab: string = 'overview'; // 'overview', 'reviews', 'notes'

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainingApi: TrainingApiService
  ) { }

  ngOnInit(): void {
    // URL'den ID ve Query'den Token'ı al
    combineLatest([this.route.params, this.route.queryParams]).subscribe(([params, queryParams]) => {
      const id = params['id']; // Route: /training-player/:id
      this.previewToken = queryParams['previewToken'];

      if (id) {
        this.courseId = +id;
        this.loadCourseData();
      }
    });
  }

  loadCourseData() {
    this.isLoading = true;
    this.trainingApi.getTrainingPublicDetail(this.courseId, this.previewToken || undefined).subscribe({
      next: (res) => {
        this.course = res;
        
        // İlk açılışta ilk içeriği oynat
        if (this.course && this.course.sections.length > 0 && this.course.sections[0].contents.length > 0) {
          this.activeContent = this.course.sections[0].contents[0];
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Kurs yüklenirken hata:", err);
        this.isLoading = false;
        // Hata durumunda dashboard'a atabiliriz
        // this.router.navigate(['/dashboard']);
      }
    });
  }

  // Listeden bir derse tıklayınca
  playContent(content: PublicContent) {
    this.activeContent = content;
    // Scroll'u yukarı al (Mobil için)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}