import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { SearchTrainingRequest, TrainingListItem } from 'src/app/shared/models/training-list.model';
import { CategoryService } from 'src/app/shared/services/category.service'; // Varsa

@Component({
  selector: 'app-active-courses',
  templateUrl: './active-courses.component.html',
  styleUrls: ['./active-courses.component.scss']
})
export class ActiveCoursesComponent implements OnInit {

  // Veri Listesi
  trainings: TrainingListItem[] = [];
  isLoading = false;
  totalRecords = 0;

  // Filtre Durumu
  isFilterOpen = false; // Sidebar kapalı başlasın
  
  // Request Modeli (Varsayılanlar)
  filterRequest: SearchTrainingRequest = {
    pageIndex: 0,
    pageSize: 10,
    onlyPrivate: false,
    searchText: ''
  };

  // UI İçin Seçenekler (API'den doldurulabilir)
  categories: any[] = []; 
  levels = [
    { id: 1, name: 'Başlangıç' },
    { id: 2, name: 'Orta Seviye' },
    { id: 3, name: 'İleri Seviye' }
  ];
  
  // Seçili Filtreler (Checkboxlar için)
  selectedCategories: number[] = [];
  selectedLevels: number[] = [];

  constructor(
    private trainingService: TrainingApiService,
    private categoryService: CategoryService, // Kategorileri çekmek için
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // URL'den arama parametresi gelirse al (Navbar araması buraya düşebilir)
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.filterRequest.searchText = params['search'];
      }
      this.loadTrainings();
    });

    this.loadCategories();
  }

  loadTrainings() {
    this.isLoading = true;
    
    // Seçili ID'leri request'e ata
    this.filterRequest.categoryIds = this.selectedCategories;
    this.filterRequest.levelIds = this.selectedLevels;

    this.trainingService.getAdvancedList(this.filterRequest).subscribe({
      next: (response: any) => {
        // Backend Response<T> yapısına göre datayı al
        const data = response.data || response.body || response;
        
        if (data) {
            this.trainings = data.items;
            this.totalRecords = data.totalCount;
        } else {
            this.trainings = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Eğitimler yüklenemedi', err);
        this.isLoading = false;
      }
    });
  }

  loadCategories() {
    // Kategori servisin varsa buradan doldur
    // this.categoryService.getCategories().subscribe(...)
    // Şimdilik dummy:
    this.categories = [
        { id: 1, title: 'Yazılım' },
        { id: 2, title: 'Tasarım' },
        { id: 3, title: 'Pazarlama' }
    ];
  }

  // --- Olay Yönetimi ---

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  onCategoryChange(catId: number, event: any) {
    if (event.target.checked) {
      this.selectedCategories.push(catId);
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== catId);
    }
    this.filterRequest.pageIndex = 0; // Filtre değişince ilk sayfaya dön
    this.loadTrainings();
  }

  onLevelChange(lvlId: number, event: any) {
    if (event.target.checked) {
      this.selectedLevels.push(lvlId);
    } else {
      this.selectedLevels = this.selectedLevels.filter(id => id !== lvlId);
    }
    this.filterRequest.pageIndex = 0;
    this.loadTrainings();
  }

  onPrivateChange(event: any) {
      this.filterRequest.onlyPrivate = event.target.checked;
      this.filterRequest.pageIndex = 0;
      this.loadTrainings();
  }

  onPageChange(page: number) {
      this.filterRequest.pageIndex = page;
      this.loadTrainings();
      window.scrollTo(0, 0);
  }
}