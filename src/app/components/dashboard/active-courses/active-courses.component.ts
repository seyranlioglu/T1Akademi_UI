import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CategoryTreeNode, FilterItem, SearchTrainingRequest, TrainingListItem } from 'src/app/shared/models/training-list.model';

@Component({
  selector: 'app-active-courses',
  templateUrl: './active-courses.component.html',
  styleUrls: ['./active-courses.component.scss']
})
export class ActiveCoursesComponent implements OnInit {

  trainings: TrainingListItem[] = [];
  isLoading = false;
  totalRecords = 0;

  // Filtre Verileri
  allCategories: CategoryTreeNode[] = []; 
  filteredCategories: CategoryTreeNode[] = []; 
  categorySearchText: string = '';

  levels: FilterItem[] = [];
  languages: FilterItem[] = [];
  instructors: FilterItem[] = [];
  ratings = [5, 4, 3, 2, 1];

  filterRequest: SearchTrainingRequest = {
    pageIndex: 0,
    pageSize: 10,
    onlyPrivate: false,
    searchText: '',
    categoryIds: [],
    levelIds: [],
    languageIds: [],
    instructorIds: []
  };

  isFilterOpen = false;

  constructor(
    private trainingService: TrainingApiService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadFilterOptions();
    
    this.route.queryParams.subscribe(params => {
      if (params['search']) this.filterRequest.searchText = params['search'];
      this.loadTrainings();
    });
  }

  loadFilterOptions() {
    this.trainingService.getFilterOptions().subscribe({
      next: (data: any) => {
        if (data) {
            this.allCategories = this.buildCategoryHierarchy(data.categories || []);
            this.filteredCategories = [...this.allCategories];

            this.levels = data.levels || [];
            this.languages = data.languages || [];
            this.instructors = data.instructors || [];
        }
      }
    });
  }

  // Düz listeyi hiyerarşik sıraya ve seviyeye (indentation) göre hazırlar
  buildCategoryHierarchy(items: FilterItem[]): CategoryTreeNode[] {
      const result: CategoryTreeNode[] = [];
      const traverse = (parentId: number | null, level: number) => {
          const children = items.filter(x => x.parentId === parentId || (parentId === null && !x.parentId));
          // Sıralama (Alfabetik)
          children.sort((a, b) => a.title.localeCompare(b.title));
          
          children.forEach(child => {
              result.push({ ...child, level: level, isVisible: true });
              traverse(child.id, level + 1);
          });
      };
      traverse(null, 0);
      return result;
  }

  // UI'da Kategori Arama
  filterCategoriesOnUI() {
      if (!this.categorySearchText) {
          this.filteredCategories = [...this.allCategories];
          return;
      }
      const lowerTerm = this.categorySearchText.toLowerCase();
      this.filteredCategories = this.allCategories.filter(c => c.title.toLowerCase().includes(lowerTerm));
  }

  loadTrainings() {
    this.isLoading = true;
    this.trainingService.getAdvancedList(this.filterRequest).subscribe({
      next: (data: any) => {
        if (data) {
            this.trainings = data.items || [];
            this.totalRecords = data.totalCount || 0;
        } else {
            this.trainings = [];
            this.totalRecords = 0;
        }
        this.isLoading = false;
        window.scrollTo(0,0);
      },
      error: () => { this.isLoading = false; this.trainings = []; }
    });
  }

  // --- GELİŞMİŞ KATEGORİ SEÇİM MANTIĞI (Cascading) ---

  onCategoryChange(cat: CategoryTreeNode, event: any) {
      const checked = event.target.checked;
      
      // 1. Tıklanan kategoriyi güncelle
      this.updateIdSelection(cat.id, checked);

      // 2. Altındakileri (Çocukları) de aynı duruma getir
      const descendants = this.getAllDescendants(cat.id);
      descendants.forEach(d => this.updateIdSelection(d.id, checked));

      // 3. Üstündekileri (Babaları) kontrol et
      if (cat.parentId) {
          this.checkAndUpdateAncestors(cat.parentId);
      }

      // 4. Listeyi Yenile
      this.filterRequest.pageIndex = 0;
      this.loadTrainings();
  }

  // ID listesine ekle/çıkar yapan atomik metod
  private updateIdSelection(id: number, checked: boolean) {
      if (!this.filterRequest.categoryIds) this.filterRequest.categoryIds = [];
      
      if (checked) {
          if (!this.filterRequest.categoryIds.includes(id)) {
              this.filterRequest.categoryIds.push(id);
          }
      } else {
          this.filterRequest.categoryIds = this.filterRequest.categoryIds.filter(x => x !== id);
      }
  }

  // Recursive olarak tüm alt öğeleri bulur
  private getAllDescendants(parentId: number): CategoryTreeNode[] {
      let children = this.allCategories.filter(c => c.parentId === parentId);
      let descendants = [...children];
      children.forEach(child => {
          descendants = [...descendants, ...this.getAllDescendants(child.id)];
      });
      return descendants;
  }

  // Recursive olarak yukarı çıkar ve babaların durumunu günceller
  private checkAndUpdateAncestors(parentId: number) {
      const parent = this.allCategories.find(c => c.id === parentId);
      if (!parent) return;

      // Bu babanın tüm çocuklarını bul
      const children = this.allCategories.filter(c => c.parentId === parentId);
      
      // Hepsi seçili mi?
      const allSelected = children.every(c => this.filterRequest.categoryIds?.includes(c.id));

      if (allSelected) {
          // Hepsi seçiliyse babayı da seç
          this.updateIdSelection(parent.id, true);
      } else {
          // Biri bile seçili değilse babayı seçimden düş
          this.updateIdSelection(parent.id, false);
      }

      // Dedeyi kontrol et (Zincirleme yukarı git)
      if (parent.parentId) {
          this.checkAndUpdateAncestors(parent.parentId);
      }
  }

  // --- DİĞER FİLTRELER ---

  toggleFilter() { this.isFilterOpen = !this.isFilterOpen; }
  onSearch() { this.filterRequest.pageIndex = 0; this.loadTrainings(); }

  onFilterChange(event: any, type: 'level' | 'language' | 'instructor') {
      const id = parseInt(event.target.value);
      const checked = event.target.checked;
      let targetArray: number[] = [];
      
      if (type === 'level') targetArray = this.filterRequest.levelIds!;
      if (type === 'language') targetArray = this.filterRequest.languageIds!;
      if (type === 'instructor') targetArray = this.filterRequest.instructorIds!;

      if (checked) targetArray.push(id);
      else {
          const idx = targetArray.indexOf(id);
          if (idx > -1) targetArray.splice(idx, 1);
      }
      this.filterRequest.pageIndex = 0;
      this.loadTrainings();
  }

  onRatingChange(rate: number) {
      this.filterRequest.minRating = (this.filterRequest.minRating === rate) ? undefined : rate;
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
  }

  get totalPages(): number {
      return this.filterRequest.pageSize > 0 ? Math.ceil(this.totalRecords / this.filterRequest.pageSize) : 0;
  }
  
  get pageArray(): number[] {
      return Array(this.totalPages).fill(0).map((x, i) => i);
  }
  
  isCategorySelected(id: number): boolean {
      return this.filterRequest.categoryIds ? this.filterRequest.categoryIds.includes(id) : false;
  }
}