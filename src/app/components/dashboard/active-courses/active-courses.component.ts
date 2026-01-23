import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CategoryTreeNode, FilterItem, SearchTrainingRequest, TrainingListItem } from 'src/app/shared/models/training-list.model';

interface FilterTag {
  type: 'search' | 'category' | 'level' | 'language' | 'instructor' | 'rating' | 'private';
  id?: number; 
  label: string; 
  value?: any; 
}

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
  isSuggestionMode = false; // Sonuç bulunamazsa öneri modu için

  constructor(
    private trainingService: TrainingApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Önce filtre seçeneklerini yükle, sonra URL'i işle
    this.loadFilterOptions();
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

            // Seçenekler hazır olunca URL parametrelerini işle
            this.handleQueryParams();
        }
      }
    });
  }

  handleQueryParams() {
    this.route.queryParams.subscribe(params => {
      // Temiz başlangıç
      this.filterRequest.searchText = '';
      this.filterRequest.categoryIds = [];

      // Arama Metni
      if (params['search']) {
        this.filterRequest.searchText = params['search'];
      }

      // Kategori ID'leri (Cascade mantığıyla)
      if (params['categoryIds']) {
        const catIdParam = params['categoryIds'];
        let requestedIds: number[] = [];
        
        if (Array.isArray(catIdParam)) {
            requestedIds = catIdParam.map(x => Number(x));
        } else {
            requestedIds = [Number(catIdParam)];
        }

        // Seçilen ana kategorileri ve altlarını listeye ekle
        requestedIds.forEach(mainId => {
           this.updateIdSelection(mainId, true);
           const descendants = this.getAllDescendants(mainId);
           descendants.forEach(d => this.updateIdSelection(d.id, true));
        });
      }

      this.loadTrainings();
    });
  }

  // --- KATEGORİ HİYERARŞİSİ ---
  buildCategoryHierarchy(items: FilterItem[]): CategoryTreeNode[] {
      const result: CategoryTreeNode[] = [];
      const getParentId = (item: any) => item.parentId || item.ParentId || null;

      const traverse = (parentId: number | null, level: number) => {
          const children = items.filter(x => getParentId(x) === parentId);
          children.sort((a, b) => a.title.localeCompare(b.title));
          children.forEach(child => {
              result.push({ 
                  id: child.id,
                  title: child.title,
                  parentId: getParentId(child),
                  level: level, 
                  isVisible: true 
              });
              traverse(child.id, level + 1);
          });
      };
      traverse(null, 0);
      return result;
  }

  filterCategoriesOnUI() {
      if (!this.categorySearchText) {
          this.filteredCategories = [...this.allCategories];
          return;
      }
      const lowerTerm = this.categorySearchText.toLowerCase();
      this.filteredCategories = this.allCategories.filter(c => c.title.toLowerCase().includes(lowerTerm));
  }

  // --- VERİ YÜKLEME ---
  loadTrainings() {
    this.isLoading = true;
    this.isSuggestionMode = false;

    this.trainingService.getAdvancedList(this.filterRequest).subscribe({
      next: (data: any) => {
        // Eğer filtre var ama sonuç yoksa -> Öneri Moduna geç
        if ((!data.items || data.items.length === 0) && this.hasActiveFilters()) {
             this.loadSuggestions();
        } else {
            this.processData(data);
        }
      },
      error: () => { this.isLoading = false; this.trainings = []; }
    });
  }

  loadSuggestions() {
      // Filtresiz sorgu at
      const suggestionRequest = { ...this.filterRequest, categoryIds: [], searchText: '', levelIds: [], languageIds: [], instructorIds: [], minRating: undefined, onlyPrivate: false };
      
      this.trainingService.getAdvancedList(suggestionRequest).subscribe({
          next: (data: any) => {
              this.isSuggestionMode = true;
              this.processData(data);
          },
          error: () => { this.isLoading = false; this.trainings = []; }
      });
  }

  processData(data: any) {
    if (data) {
        this.trainings = data.items || [];
        this.totalRecords = data.totalCount || 0;
    } else {
        this.trainings = [];
        this.totalRecords = 0;
    }
    this.isLoading = false;
    window.scrollTo(0,0);
  }

  hasActiveFilters(): boolean {
      return (
          (this.filterRequest.categoryIds && this.filterRequest.categoryIds.length > 0) ||
          !!this.filterRequest.searchText ||
          (this.filterRequest.levelIds && this.filterRequest.levelIds.length > 0) ||
          (this.filterRequest.languageIds && this.filterRequest.languageIds.length > 0) ||
          (this.filterRequest.instructorIds && this.filterRequest.instructorIds.length > 0) ||
          (this.filterRequest.minRating !== undefined && this.filterRequest.minRating > 0) ||
          this.filterRequest.onlyPrivate === true
      );
  }

  // --- RESİM YÖNETİMİ ---
  getCourseImage(item: TrainingListItem): string {
    // 1. Kendi Resmi
    if (item.headerImage) return item.headerImage;

    // 2. Kategori Resmi (category{id}.png)
    const imageId = item.parentCategoryId ? item.parentCategoryId : item.categoryId;
    if (imageId) return `assets/images/defaults/category${imageId}.png`;

    // 3. Default
    return 'assets/images/defaults/default.jpg';
  }

  handleImageError(event: any, item: TrainingListItem) {
    const imgElement = event.target;
    const imageId = item.parentCategoryId ? item.parentCategoryId : item.categoryId;
    const defaultImage = 'assets/images/defaults/default.jpg';

    if (imgElement.src.includes('default.jpg')) return;

    if (imgElement.src.includes(`category${imageId}.png`)) {
         imgElement.src = defaultImage;
         return;
    }

    if (imageId) {
        imgElement.src = `assets/images/defaults/category${imageId}.png`;
    } else {
        imgElement.src = defaultImage;
    }
  }

  // --- KART UI HELPER ---
  getCategoryPath(categoryId?: number): string {
      if (!categoryId) return '';
      const cat = this.allCategories.find(c => c.id === categoryId);
      if (!cat) return '';
      if (cat.parentId) {
          const parent = this.allCategories.find(p => p.id === cat.parentId);
          return parent ? `${parent.title} • ${cat.title}` : cat.title;
      }
      return cat.title;
  }

  // --- TAG YÖNETİMİ ---
  get selectedTags(): FilterTag[] {
    const tags: FilterTag[] = [];

    if (this.filterRequest.searchText) {
        tags.push({ type: 'search', label: `Ara: "${this.filterRequest.searchText}"`, value: this.filterRequest.searchText });
    }

    if (this.filterRequest.categoryIds) {
      this.filterRequest.categoryIds.forEach(id => {
         const cat = this.allCategories.find(c => c.id === id);
         // Sadece parentId'si null olanları veya ekranda kalabalık etmeyecekleri göstermek daha iyi olabilir ama şimdilik hepsi:
         if (cat) tags.push({ type: 'category', id: id, label: cat.title });
      });
    }
    
    if (this.filterRequest.levelIds) {
      this.filterRequest.levelIds.forEach(id => {
        const lvl = this.levels.find(l => l.id === id);
        if (lvl) tags.push({ type: 'level', id: id, label: lvl.title });
      });
    }

    if (this.filterRequest.languageIds) {
        this.filterRequest.languageIds.forEach(id => {
          const lng = this.languages.find(l => l.id === id);
          if (lng) tags.push({ type: 'language', id: id, label: lng.title });
        });
    }

    if (this.filterRequest.instructorIds) {
        this.filterRequest.instructorIds.forEach(id => {
          const inst = this.instructors.find(i => i.id === id);
          if (inst) tags.push({ type: 'instructor', id: id, label: inst.title });
        });
    }

    if (this.filterRequest.minRating !== undefined && this.filterRequest.minRating !== null) {
        tags.push({ type: 'rating', label: `${this.filterRequest.minRating} Yıldız ve üzeri`, value: this.filterRequest.minRating });
    }

    if (this.filterRequest.onlyPrivate) {
        tags.push({ type: 'private', label: 'Sadece Kuruma Özel' });
    }

    return tags;
  }

  removeTag(tag: FilterTag) {
    if (tag.type === 'search') this.filterRequest.searchText = '';
    
    if (tag.type === 'category') {
        const catNode = this.allCategories.find(c => c.id === tag.id);
        if (catNode) { 
            this.onCategoryChange(catNode, { target: { checked: false } }); 
            this.clearUrlParams();
            return; 
        }
    }
    if (tag.type === 'level') this.filterRequest.levelIds = this.filterRequest.levelIds?.filter(id => id !== tag.id);
    if (tag.type === 'language') this.filterRequest.languageIds = this.filterRequest.languageIds?.filter(id => id !== tag.id);
    if (tag.type === 'instructor') this.filterRequest.instructorIds = this.filterRequest.instructorIds?.filter(id => id !== tag.id);
    if (tag.type === 'rating') this.filterRequest.minRating = undefined;
    if (tag.type === 'private') this.filterRequest.onlyPrivate = false;

    this.clearUrlParams();
    this.filterRequest.pageIndex = 0;
    this.loadTrainings();
  }

  resetAllFilters() {
    this.filterRequest = {
      pageIndex: 0, pageSize: 10, onlyPrivate: false, searchText: '',
      categoryIds: [], levelIds: [], languageIds: [], instructorIds: [], minRating: undefined
    };
    this.categorySearchText = '';
    this.isSuggestionMode = false;
    this.filterCategoriesOnUI();
    this.clearUrlParams();
    this.loadTrainings();
  }

  clearUrlParams() {
      this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
      });
  }

  // --- EVENTS ---

  onCategoryChange(cat: CategoryTreeNode, event: any) {
      const checked = event.target.checked;
      this.updateIdSelection(cat.id, checked);
      const descendants = this.getAllDescendants(cat.id);
      descendants.forEach(d => this.updateIdSelection(d.id, checked));
      if (cat.parentId) this.checkAndUpdateAncestors(cat.parentId);
      this.filterRequest.pageIndex = 0;
      this.loadTrainings();
  }

  private updateIdSelection(id: number, checked: boolean) {
      if (!this.filterRequest.categoryIds) this.filterRequest.categoryIds = [];
      if (checked) {
          if (!this.filterRequest.categoryIds.includes(id)) this.filterRequest.categoryIds.push(id);
      } else {
          this.filterRequest.categoryIds = this.filterRequest.categoryIds.filter(x => x !== id);
      }
  }

  private getAllDescendants(parentId: number): CategoryTreeNode[] {
      let children = this.allCategories.filter(c => c.parentId === parentId);
      let descendants = [...children];
      children.forEach(child => { descendants = [...descendants, ...this.getAllDescendants(child.id)]; });
      return descendants;
  }

  private checkAndUpdateAncestors(parentId: number) {
      const parent = this.allCategories.find(c => c.id === parentId);
      if (!parent) return;
      const children = this.allCategories.filter(c => c.parentId === parentId);
      const allSelected = children.every(c => this.filterRequest.categoryIds?.includes(c.id));
      if (allSelected) this.updateIdSelection(parent.id, true);
      else this.updateIdSelection(parent.id, false);
      if (parent.parentId) this.checkAndUpdateAncestors(parent.parentId);
  }

  toggleFilter() { this.isFilterOpen = !this.isFilterOpen; }
  onSearch() { this.filterRequest.pageIndex = 0; this.loadTrainings(); }
  onPrivateChange(event: any) { this.filterRequest.onlyPrivate = event.target.checked; this.filterRequest.pageIndex = 0; this.loadTrainings(); }
  
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

  onRatingChange(rate: number) { this.filterRequest.minRating = (this.filterRequest.minRating === rate) ? undefined : rate; this.filterRequest.pageIndex = 0; this.loadTrainings(); }
  onPageChange(page: number) { this.filterRequest.pageIndex = page; this.loadTrainings(); }
  
  get totalPages(): number { return this.filterRequest.pageSize > 0 ? Math.ceil(this.totalRecords / this.filterRequest.pageSize) : 0; }
  get pageArray(): number[] { return Array(this.totalPages).fill(0).map((x, i) => i); }
  isCategorySelected(id: number): boolean { return this.filterRequest.categoryIds ? this.filterRequest.categoryIds.includes(id) : false; }
}