import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ContentLibraryApiService } from 'src/app/shared/api/content-library-api.service';

@Component({
  selector: 'app-content-library-selector',
  templateUrl: './content-library-selector.component.html',
  styleUrls: ['./content-library-selector.component.scss']
})
export class ContentLibrarySelectorComponent implements OnInit {

  // --- Inputs ---
  /**
   * Seçicinin ne döndüreceğini belirler.
   * 'id': Sadece Guid döner (Default - Mevcut sistemler için).
   * 'path': Dosya yolunu (URL) string olarak döner (Eğitmen Profili vb. için).
   * 'object': Tüm DTO objesini döner.
   */
  @Input() returnType: 'id' | 'path' | 'object' = 'id';

  /**
   * Sadece belirli dosya tiplerini filtrelemek için (Örn: ['.jpg', '.png'] veya ContentTypeId)
   * Opsiyonel, backend desteğine bağlı.
   */
  @Input() fileTypeFilter: string | null = null; 

  // --- Outputs ---
  @Output() onSelect = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  // --- Variables ---
  contents: any[] = [];
  isLoading: boolean = false;
  selectedItem: any = null;
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 12; // Grid görünümü için 12 ideal
  totalItems: number = 0;
  searchText: string = '';

  constructor(
    private contentLibraryApi: ContentLibraryApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadContents();
  }

  loadContents(): void {
    this.isLoading = true;
    
    // API servisinde getList metodunun parametre yapısına göre düzenlendi
    // Eğer backend'de fileType filtresi varsa buraya eklenebilir.
    this.contentLibraryApi.getList(this.currentPage, this.pageSize, this.searchText).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.contents = res.data.items; // PagedList yapısı
          this.totalItems = res.data.totalCount;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Kütüphane yüklenemedi:', err);
        this.toastr.error('İçerikler yüklenirken hata oluştu.');
        this.isLoading = false;
      }
    });
  }

  // Kullanıcı bir öğeye tıkladığında
  selectItem(item: any): void {
    this.selectedItem = item;
  }

  // "Seç" butonuna basıldığında
  confirmSelection(): void {
    if (!this.selectedItem) {
      this.toastr.warning('Lütfen bir içerik seçin.');
      return;
    }

    let returnValue: any;

    switch (this.returnType) {
      case 'path':
        // Backend entity'sinde "FilePath" olduğunu analiz etmiştik.
        // Frontend modelinde küçük harfle "filePath" olabilir, kontrol edip atıyoruz.
        returnValue = this.selectedItem.filePath || this.selectedItem.FilePath;
        break;
      
      case 'object':
        returnValue = this.selectedItem;
        break;

      case 'id':
      default:
        returnValue = this.selectedItem.id || this.selectedItem.Id;
        break;
    }

    this.onSelect.emit(returnValue);
  }

  cancel(): void {
    this.onCancel.emit();
  }

  // Arama işlemi
  onSearch(): void {
    this.currentPage = 1;
    this.loadContents();
  }

  // Sayfa değişimi
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadContents();
  }
}