import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { CategoryTreeNode, FilterItem, SearchTrainingRequest, TrainingListItem } from 'src/app/shared/models/training-list.model';
import * as bootstrap from 'bootstrap'; 

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

  sortOptions = [
    { label: 'En Yeniler', value: 'newest' },
    { label: 'En Eskiler', value: 'oldest' },
    { label: 'Fiyat: Artan', value: 'price_asc' },
    { label: 'Fiyat: Azalan', value: 'price_desc' },
    { label: 'Puan: Yüksekten Düşüğe', value: 'rating' }
];

  // GÖRÜNÜM MODU (Varsayılan Grid)
  viewMode: 'grid' | 'list' = 'grid';

  trainings: TrainingListItem[] = [];
  isLoading = false;
  totalRecords = 0;

  // --- FİLTRE DEĞİŞKENLERİ ---
  allCategories: CategoryTreeNode[] = []; 
  filteredCategories: CategoryTreeNode[] = []; 
  categorySearchText: string = '';

  levels: FilterItem[] = [];
  languages: FilterItem[] = [];
  instructors: FilterItem[] = [];
  ratings = [5, 4, 3, 2, 1];

  filterRequest: SearchTrainingRequest = {
    pageIndex: 0,
    pageSize: 12, // Grid yapısına uygun olması için 12 (4x3) ideal
    onlyPrivate: false,
    searchText: '',
    categoryIds: [],
    levelIds: [],
    languageIds: [],
    instructorIds: [],
    sortBy: 'newest'
  };

  isFilterOpen = false;
  isSuggestionMode = false;

  // --- BİLDİRİM (TOAST) ---
  toastMessage: string = '';
  showToast: boolean = false;
  toastType: 'success' | 'error' = 'success';
  private toastTimeout: any;

  // --- SEPET & FİYAT MODALI ---
  selectedCourseForCart: TrainingListItem | null = null;
  pricingTiers: any[] = [];
  selectedTier: any = null;
  licenseCount: number = 1;
  modalTotalPrice: number = 0;
  isAddingToCart: boolean = false;
  private cartModal: any; 

  @ViewChild('addToCartModal') addToCartModalEl!: ElementRef;

  constructor(
    private trainingService: TrainingApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadFilterOptions();
  }

  onSortChange(event: any) {
    this.filterRequest.sortBy = event.target.value;
    this.filterRequest.pageIndex = 0; // Sıralama değişince ilk sayfaya dön
    this.loadTrainings();
}

  // --- GÖRÜNÜM DEĞİŞTİRME ---
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
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
            
            this.handleQueryParams();
        }
      }
    });
  }

  handleQueryParams() {
    this.route.queryParams.subscribe(params => {
      this.filterRequest.searchText = '';
      this.filterRequest.categoryIds = [];

      if (params['search']) {
        this.filterRequest.searchText = params['search'];
      }

      if (params['categoryIds']) {
        const catIdParam = params['categoryIds'];
        let requestedIds: number[] = [];
        
        if (Array.isArray(catIdParam)) {
            requestedIds = catIdParam.map(x => Number(x));
        } else {
            requestedIds = [Number(catIdParam)];
        }

        requestedIds.forEach(mainId => {
           this.updateIdSelection(mainId, true);
           const descendants = this.getAllDescendants(mainId);
           descendants.forEach(d => this.updateIdSelection(d.id, true));
        });
      }

      this.loadTrainings();
    });
  }

  loadTrainings() {
    this.isLoading = true;
    this.isSuggestionMode = false;

    this.trainingService.getAdvancedList(this.filterRequest).subscribe({
      next: (data: any) => {
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

  // --- FAVORİ İŞLEMLERİ ---
  toggleWishlist(item: TrainingListItem) {
      this.trainingService.toggleFavorite(item.id).subscribe({
          next: (res) => {
              item.isFavorite = !item.isFavorite;
              if(item.isFavorite) {
                  this.showNotification('Favorilere eklendi', 'success');
              } else {
                  this.showNotification('Favorilerden çıkarıldı', 'success');
              }
          },
          error: (err) => {
              console.error(err);
              this.showNotification('İşlem başarısız oldu', 'error');
          }
      });
  }

  // --- SEPET İŞLEMLERİ ---
  openCartModal(item: TrainingListItem) {
    if (item.isAssigned) return;

    this.selectedCourseForCart = item;
    this.pricingTiers = []; 
    this.selectedTier = null;
    this.modalTotalPrice = 0;
    this.licenseCount = 1;

    if (!this.cartModal) {
      this.cartModal = new bootstrap.Modal(this.addToCartModalEl.nativeElement);
    }
    this.cartModal.show();

    if (item.priceTierId && item.priceTierId > 0) {
        this.trainingService.getTierPricing(item.priceTierId).subscribe({
          next: (res) => {
            const data = res.data || res.body || res;
            if (Array.isArray(data) && data.length > 0) {
              this.pricingTiers = data;
              this.selectTier(this.pricingTiers[0]);
            }
          },
          error: (err) => {
            console.error("Fiyatlar çekilemedi", err);
          }
        });
    } else {
        // Fallback: Karttaki fiyatı kullan
        this.calculateModalTotal();
    }
  }

  selectTier(tier: any) {
    this.selectedTier = tier;
    this.licenseCount = tier.minLicenceCount;
    this.calculateModalTotal();
  }

  increaseCount() {
    this.licenseCount++;
    this.handleCountChangeLogic();
  }

  decreaseCount() {
    if (this.licenseCount > 1) {
      this.licenseCount--;
      this.handleCountChangeLogic();
    }
  }

  onCountChange(event: any) {
    let val = parseInt(event.target.value);
    if (isNaN(val) || val < 1) val = 1;
    this.licenseCount = val;
    this.handleCountChangeLogic();
  }

  handleCountChangeLogic() {
    if (this.pricingTiers.length > 0) {
        const val = this.licenseCount;
        const matchingTier = this.pricingTiers.find(t => val >= t.minLicenceCount && val <= t.maxLicenceCount);
        const lastTier = this.pricingTiers[this.pricingTiers.length - 1];
        
        if (matchingTier) {
            this.selectedTier = matchingTier;
        } else if (val > lastTier.maxLicenceCount) {
            this.selectedTier = lastTier;
        }
    }
    this.calculateModalTotal();
  }

  calculateModalTotal() {
    if (this.selectedTier) {
      let unitPrice = this.selectedTier.amount;
      if (this.selectedTier.discountRate > 0) {
        unitPrice = unitPrice - (unitPrice * (this.selectedTier.discountRate / 100));
      }
      this.modalTotalPrice = unitPrice * this.licenseCount;
    } else {
        if(this.selectedCourseForCart) {
            this.modalTotalPrice = this.selectedCourseForCart.currentAmount * this.licenseCount;
        }
    }
  }

  confirmAddToCart() {
    if (!this.selectedCourseForCart) return;

    this.isAddingToCart = true;

    this.cartService.addToCart(this.selectedCourseForCart.id, this.licenseCount).subscribe({
        next: (res) => {
            this.isAddingToCart = false;
            const isSuccess = res.isSuccess || (res.header && res.header.result);
            
            if (isSuccess) {
                this.showNotification('Sepet güncellendi!', 'success');
                this.cartModal.hide();
                this.selectedCourseForCart = null;
            } else {
                const errorMsg = res.header?.msg || res.message || 'Bir hata oluştu.';
                this.showNotification(errorMsg, 'error');
            }
        },
        error: (err) => {
            this.isAddingToCart = false;
            console.error(err);
            this.showNotification('Sunucu ile iletişim hatası.', 'error');
        }
    });
  }

  showNotification(message: string, type: 'success' | 'error') {
      this.toastMessage = message;
      this.toastType = type;
      this.showToast = true;

      if (this.toastTimeout) {
          clearTimeout(this.toastTimeout);
      }

      this.toastTimeout = setTimeout(() => {
          this.showToast = false;
      }, 3000);
  }

  getCourseImage(item: TrainingListItem): string {
    if (item.headerImage && 
        item.headerImage.toLowerCase() !== 'none' && 
        item.headerImage.trim() !== '' &&
        !item.headerImage.includes('default.jpg')) {
        return item.headerImage;
    }

    const imageId = (item.parentCategoryId && item.parentCategoryId > 0) 
                    ? item.parentCategoryId 
                    : item.categoryId;

    if (imageId && imageId > 0) {
        return `assets/images/defaults/category${imageId}.png`;
    }

    return 'assets/images/defaults/default.jpg';
  }

  handleImageError(event: any, item: TrainingListItem) {
    const imgElement = event.target;
    if (imgElement.src.includes('default.jpg')) return;
    imgElement.src = 'assets/images/defaults/default.jpg';
  }

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

  buildCategoryHierarchy(items: FilterItem[]): CategoryTreeNode[] {
      const result: CategoryTreeNode[] = [];
      const getParentId = (item: any) => item.parentId || item.ParentId || null;

      const traverse = (parentId: number | null, level: number) => {
          const children = items.filter(x => getParentId(x) === parentId);
          children.sort((a, b) => a.title.localeCompare(b.title));
          children.forEach(child => {
              result.push({ 
                  id: child.id, title: child.title, parentId: getParentId(child), level: level, isVisible: true 
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

  get selectedTags(): FilterTag[] {
    const tags: FilterTag[] = [];
    if (this.filterRequest.searchText) tags.push({ type: 'search', label: `Ara: "${this.filterRequest.searchText}"`, value: this.filterRequest.searchText });
    if (this.filterRequest.categoryIds) this.filterRequest.categoryIds.forEach(id => { const cat = this.allCategories.find(c => c.id === id); if (cat) tags.push({ type: 'category', id: id, label: cat.title }); });
    if (this.filterRequest.levelIds) this.filterRequest.levelIds.forEach(id => { const lvl = this.levels.find(l => l.id === id); if (lvl) tags.push({ type: 'level', id: id, label: lvl.title }); });
    if (this.filterRequest.languageIds) this.filterRequest.languageIds.forEach(id => { const lng = this.languages.find(l => l.id === id); if (lng) tags.push({ type: 'language', id: id, label: lng.title }); });
    if (this.filterRequest.instructorIds) this.filterRequest.instructorIds.forEach(id => { const inst = this.instructors.find(i => i.id === id); if (inst) tags.push({ type: 'instructor', id: id, label: inst.title }); });
    if (this.filterRequest.minRating) tags.push({ type: 'rating', label: `${this.filterRequest.minRating} Yıldız ve üzeri`, value: this.filterRequest.minRating });
    if (this.filterRequest.onlyPrivate) tags.push({ type: 'private', label: 'Sadece Kuruma Özel' });
    return tags;
  }

  removeTag(tag: FilterTag) {
    if (tag.type === 'search') this.filterRequest.searchText = '';
    if (tag.type === 'category') { const catNode = this.allCategories.find(c => c.id === tag.id); if (catNode) { this.onCategoryChange(catNode, { target: { checked: false } }); this.clearUrlParams(); return; } }
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
    this.filterRequest = { pageIndex: 0, pageSize: 12, onlyPrivate: false, searchText: '', categoryIds: [], levelIds: [], languageIds: [], instructorIds: [], minRating: undefined };
    this.categorySearchText = '';
    this.isSuggestionMode = false;
    this.filterCategoriesOnUI();
    this.clearUrlParams();
    this.loadTrainings();
  }

  clearUrlParams() {
      this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

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
      if (checked) { if (!this.filterRequest.categoryIds.includes(id)) this.filterRequest.categoryIds.push(id); } 
      else { this.filterRequest.categoryIds = this.filterRequest.categoryIds.filter(x => x !== id); }
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
      else { const idx = targetArray.indexOf(id); if (idx > -1) targetArray.splice(idx, 1); }
      this.filterRequest.pageIndex = 0;
      this.loadTrainings();
  }

  onRatingChange(rate: number) { this.filterRequest.minRating = (this.filterRequest.minRating === rate) ? undefined : rate; this.filterRequest.pageIndex = 0; this.loadTrainings(); }
  onPageChange(page: number) { this.filterRequest.pageIndex = page; this.loadTrainings(); }
  
  get totalPages(): number { return this.filterRequest.pageSize > 0 ? Math.ceil(this.totalRecords / this.filterRequest.pageSize) : 0; }
  get pageArray(): number[] { return Array(this.totalPages).fill(0).map((x, i) => i); }
  isCategorySelected(id: number): boolean { return this.filterRequest.categoryIds ? this.filterRequest.categoryIds.includes(id) : false; }
}