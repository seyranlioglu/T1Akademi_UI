import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ContentLibraryApiService } from 'src/app/shared/api/content-library-api.service';
import { GlobalUploadService } from 'src/app/shared/services/global-upload.service'; // Upload servisi

@Component({
  selector: 'app-content-library-selector',
  templateUrl: './content-library-selector.component.html',
  styleUrls: ['./content-library-selector.component.scss']
})
export class ContentLibrarySelectorComponent implements OnInit {

  // Girdiler
  @Input() fileType: 'all' | 'image' | 'video' | 'document' = 'all';
  @Input() returnType: 'id' | 'path' = 'id';

  // Çıktılar
  @Output() onSelect = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  // Veri Listeleri
  allContents: any[] = [];
  filteredContents: any[] = [];
  paginatedContents: any[] = [];

  // Seçim
  selectedItem: any = null;
  isLoading = false;

  // Arama
  searchText: string = '';

  // Sayfalama
  currentPage: number = 1;
  pageSize: number = 11; // 1 tane 'Yeni Ekle' kartı + 11 içerik = 12 grid
  totalItems: number = 0;
  totalPages: number = 1;

  constructor(
    private contentLibraryApi: ContentLibraryApiService,
    private toastr: ToastrService,
    private globalUploadService: GlobalUploadService // Servisi inject ettik
  ) { }

  ngOnInit(): void {
    this.loadContents();

    // Upload servisini dinle: Eğer bir dosya yüklenirse listeyi yenile
    this.globalUploadService.onUploadFinished.subscribe(() => {
        this.loadContents();
    });
  }

  loadContents() {
    this.isLoading = true;
    this.contentLibraryApi.getList().subscribe({
      next: (res: any) => {
        // 🔥 KRİTİK DÜZELTME: Backend yapısına göre Array 'body' içinde
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

  // --- UPLOAD MODALINI AÇ ---
  openUploadModal() {
      // Global upload servisini tetikle
      this.globalUploadService.openUploadDialog(); 
  }

  // --- ARAMA VE FİLTRELEME ---
  onSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    let temp = [...this.allContents]; // Referansı kopar

    // 1. Dosya Türü Filtresi
    if (this.fileType !== 'all') {
      temp = temp.filter(item => {
        // Backend'den FileType dönüyor olabilir veya uzantıdan buluruz
        // item.fileTypeId veya uzantı kontrolü
        const ext = this.getExtension(item.filePath);
        
        if (this.fileType === 'image') return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        if (this.fileType === 'video') return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);
        if (this.fileType === 'document') return ['.pdf', '.doc', '.docx', '.xls', '.xlsx'].includes(ext);
        
        return true;
      });
    }

    // 2. Metin Arama Filtresi
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      temp = temp.filter(item => 
        (item.fileName && item.fileName.toLowerCase().includes(searchLower)) || 
        (item.title && item.title.toLowerCase().includes(searchLower))
      );
    }

    this.filteredContents = temp;
    this.totalItems = this.filteredContents.length;
    
    // 3. Sayfa Sayısını Hesapla
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    if (this.totalPages < 1) this.totalPages = 1;

    // 4. Sayfalama
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

  // --- YARDIMCI METOTLAR ---
  getExtension(path: string): string {
    if (!path) return '';
    try {
        return '.' + path.split('.').pop()?.toLowerCase();
    } catch { return ''; }
  }

  // --- SEÇİM İŞLEMLERİ ---
  selectItem(item: any) {
    this.selectedItem = item;
  }

  confirmSelection() {
    if (this.selectedItem) {
      // 🔥 İsteğine göre Path veya ID dönüyor
      const valueToEmit = this.returnType === 'path' ? this.selectedItem.filePath : this.selectedItem.id;
      this.onSelect.emit(valueToEmit);
    }
  }

  cancel() {
    this.onCancel.emit();
  }
}