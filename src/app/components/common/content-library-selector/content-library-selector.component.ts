import { Component, EventEmitter, HostListener, Input, OnInit, Output, Optional } from '@angular/core'; // Optional eklendi
import { ToastrService } from 'ngx-toastr';
import { ContentLibraryApiService } from 'src/app/shared/api/content-library-api.service';
import { GlobalUploadService } from 'src/app/shared/services/global-upload.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'; // DynamicDialogRef eklendi
import { ContentPreviewModalComponent } from 'src/app/components/common/modals/content-preview-modal/content-preview-modal.component';

@Component({
  selector: 'app-content-library-selector',
  templateUrl: './content-library-selector.component.html',
  styleUrls: ['./content-library-selector.component.scss'],
  providers: [DialogService]
})
export class ContentLibrarySelectorComponent implements OnInit {

  // ... (Değişkenler aynı kalsın) ...
  @Input() fileType: 'all' | 'image' | 'video' | 'document' = 'all';
  @Input() returnType: 'id' | 'path' | 'object' = 'id'; // 'object' seçeneği eklendi (tüm nesneyi dönmek isteyebiliriz)
  @Output() onSelect = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  // ... (Diğer değişkenler aynı) ...
  allContents: any[] = [];
  filteredContents: any[] = [];
  paginatedContents: any[] = [];
  selectedItem: any = null;
  isLoading = false;
  searchText: string = '';
  currentPage: number = 1;
  pageSize: number = 11;
  totalItems: number = 0;
  totalPages: number = 1;
  activeMenuId: number | null = null;

  constructor(
    private contentLibraryApi: ContentLibraryApiService,
    private toastr: ToastrService,
    private globalUploadService: GlobalUploadService,
    private dialogService: DialogService,
    @Optional() public ref: DynamicDialogRef // 🔥 EKLENDİ: Dialog kontrolü için
  ) { }

  ngOnInit(): void {
    this.loadContents();
    this.globalUploadService.onUploadFinished.subscribe(() => {
        this.loadContents();
    });
  }

  // ... (loadContents, applyFilters, pagination vb. aynı kalsın) ...
  loadContents() {
    this.isLoading = true;
    this.contentLibraryApi.getList().subscribe({
      next: (res: any) => {
        this.allContents = res.body || res.data || (Array.isArray(res) ? res : []);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Kütüphane yüklenemedi');
        this.isLoading = false;
      }
    });
  }

  openUploadModal() {
      this.globalUploadService.openUploadDialog(); 
  }

  onSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    let temp = [...this.allContents];

    if (this.fileType !== 'all') {
      temp = temp.filter(item => {
        const ext = this.getExtension(item.filePath);
        if (this.fileType === 'image') return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        if (this.fileType === 'video') {
            return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext) || this.isYoutube(item.filePath);
        }
        if (this.fileType === 'document') return ['.pdf', '.doc', '.docx', '.xls', '.xlsx'].includes(ext);
        return true;
      });
    }

    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      temp = temp.filter(item => 
        (item.fileName && item.fileName.toLowerCase().includes(searchLower)) || 
        (item.title && item.title.toLowerCase().includes(searchLower))
      );
    }

    this.filteredContents = temp;
    this.totalItems = this.filteredContents.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    if (this.totalPages < 1) this.totalPages = 1;
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedContents = this.filteredContents.slice(startIndex, endIndex);
  }

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.updatePagination();
    }
  }

  getExtension(path: string): string {
    if (!path) return '';
    try {
        if (path.includes('http') && !path.split('/').pop()?.includes('.')) return '';
        return '.' + path.split('.').pop()?.toLowerCase();
    } catch { return ''; }
  }

  isYoutube(path: string): boolean {
      if (!path) return false;
      const lower = path.toLowerCase();
      return lower.includes('youtube.com') || lower.includes('youtu.be');
  }

  selectItem(item: any) {
    this.selectedItem = item;
  }

  // 🔥 GÜNCELLENEN METOD: Hem Event Emit hem Dialog Close
  confirmSelection() {
    if (this.selectedItem) {
      let valueToEmit: any;

      if (this.returnType === 'path') {
          valueToEmit = this.selectedItem.filePath;
      } else if (this.returnType === 'object') {
          valueToEmit = this.selectedItem; // Tüm objeyi dön
      } else {
          valueToEmit = this.selectedItem.id; // Varsayılan ID
      }

      // 1. Output ile dışarı ver (Template kullanımı için)
      this.onSelect.emit(valueToEmit);

      // 2. Dialog ile açılmışsa dialogu kapat ve veriyi dön (DynamicDialog kullanımı için)
      if (this.ref) {
          // CourseSectionComponent tüm objeyi bekliyor olabilir, garanti olsun diye
          // eğer returnType 'object' değilse bile dialog'da genellikle obje dönmek daha güvenlidir.
          // Ama senin CourseSection kodunda `selectedContent.id` ve `selectedContent.title` kullanılıyor.
          // Bu yüzden burada tüm objeyi (selectedItem) dönmek zorundayız.
          this.ref.close(this.selectedItem); 
      }
    }
  }

  cancel() {
    this.onCancel.emit();
    if (this.ref) {
        this.ref.close(null);
    }
  }

  // ... (Menü işlemleri aynı kalsın) ...
  toggleMenu(event: Event, itemId: number) {
    event.stopPropagation();
    if (this.activeMenuId === itemId) {
      this.activeMenuId = null;
    } else {
      this.activeMenuId = itemId;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.activeMenuId = null;
  }

  onPreviewClick(event: Event, item: any) {
    event.stopPropagation();
    this.activeMenuId = null;
    this.dialogService.open(ContentPreviewModalComponent, {
        header: 'İçerik Önizleme',
        width: '90%',
        contentStyle: { "max-height": "90vh", "overflow": "hidden", "padding": "0" },
        baseZIndex: 10000,
        data: item,
        dismissableMask: true,
        showHeader: false 
    });
  }
}