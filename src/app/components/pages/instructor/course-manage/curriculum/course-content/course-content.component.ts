import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store'; // 🔥 Store Eklendi

import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { ContentPreviewModalComponent } from 'src/app/components/common/modals/content-preview-modal/content-preview-modal.component';
import { ContentLibrarySelectorComponent } from 'src/app/components/common/content-library-selector/content-library-selector.component';
import { loadCourse } from 'src/app/shared/store/course.actions'; // 🔥 Action Eklendi

@Component({
  selector: 'app-course-content',
  templateUrl: './course-content.component.html',
  styleUrls: ['./course-content.component.scss'],
  providers: [DialogService]
})
export class CourseContentComponent {
  
  @Input() data: any; 
  @Output() contentUpdated = new EventEmitter<any>();

  isEditing: boolean = false;
  ref: DynamicDialogRef | undefined;

  constructor(
    private dialogService: DialogService,
    private trainingService: TrainingApiService,
    private toastr: ToastrService,
    private store: Store // 🔥 Store Inject Edildi
  ) {}

  // --- 1. İKON BELİRLEME ---
  getIconClass(item: any): string {
    if (!item) return 'bx-error text-muted';
    if (item.contentType?.code === 'exm') return 'bx-task text-warning';
    
    // Veri kaynağını kontrol et (ContentLibrary veya DTO)
    const lib = item.contentLibrary || item.trainingContentLibraryDto || {};
    
    // Dosya adı önceliği: Library > DTO > Title
    const fileName = (lib.FileName || lib.fileName || lib.trainingContentLibraryFileName || item.title || '').toLowerCase();
    
    if (fileName.endsWith('.pdf')) return 'bxs-file-pdf text-danger';
    if (fileName.match(/\.(jpeg|jpg|png|gif|webp)$/)) return 'bxs-image text-success';
    if (fileName.match(/\.(doc|docx)$/)) return 'bxs-file-doc text-primary';
    
    return 'bx-video text-primary'; 
  }

  // --- 2. ÖNİZLEME (MODAL VERİ DÖNÜŞÜMÜ) ---
  openPreview() {
    // 1. Veri Kaynağını Bul
    const lib = this.data.contentLibrary || this.data.trainingContentLibraryDto || {};
    
    // 2. Verileri Modal'ın beklediği düz formata (camelCase) çevir
    const modalData = {
        // ID: Retry upload için gerekli
        id: lib.Id || lib.id || this.data.contentLibraryId,
        
        // Dosya Yolu: PascalCase veya camelCase gelebilir, hepsini kontrol et
        filePath: lib.FilePath || lib.filePath || lib.trainingContentLibraryFilePath || this.data.filePath,
        
        // Dosya Adı
        fileName: lib.FileName || lib.fileName || lib.trainingContentLibraryFileName || this.data.title || 'İçerik',
        
        // Başlık (Modal Header için genelde title kullanılır)
        title: this.data.title || lib.FileName,
        
        // Ekstra bilgiler (Modal içinde gösteriliyorsa)
        description: this.data.description,
        fileType: lib.FileType || lib.fileType,
        thumbnail: lib.Thumbnail || lib.thumbnail || lib.trainingContentLibraryThumbnail,
        videoDuration: lib.VideoDuration || lib.videoDuration || lib.trainingContentLibraryVideoDuration,
        documentFileSize: lib.DocumentFileSize || lib.documentFileSize || lib.trainingContentLibraryDocumentFileSize,
        
        // Orijinal veriyi de iliştir (ne olur ne olmaz)
        content: this.data 
    };

    // 3. Dosya yolu kontrolü
    if (!modalData.filePath) {
        this.toastr.warning('Bu dersin dosya yolu bulunamadı.', 'Dosya Yok');
        return;
    }

    // 4. Modalı Aç
    this.dialogService.open(ContentPreviewModalComponent, {
        header: modalData.title,
        width: '80%',
        height: 'auto',
        baseZIndex: 10002,
        modal: true,
        dismissableMask: true,
        data: modalData // 🔥 Düzeltilmiş ve hazırlanmış veriyi gönderiyoruz
    });
  }

  // --- 3. İÇERİK DEĞİŞTİRME (KÜTÜPHANEDEN SEÇ) ---
  changeContent() {
    this.ref = this.dialogService.open(ContentLibrarySelectorComponent, {
        header: 'Yeni İçerik Seç',
        width: '70%',
        contentStyle: { 'max-height': '600px', 'overflow': 'auto' },
        baseZIndex: 10001,
        dismissableMask: true
    });

    this.ref.onClose.subscribe((selectedContent: any) => {
        if (selectedContent) {
            // Seçilen yeni içeriği mevcut dataya geçici olarak yaz
            this.data.newLibraryItem = selectedContent; // UI güncellemesi
            this.data.contentLibraryId = selectedContent.id; // Backend'e gidecek ID
            this.toastr.info(`"${selectedContent.fileName}" seçildi. Kaydetmeyi unutmayın.`);
        }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    // İptal edilirse geçici seçimi temizle
    if (!this.isEditing && this.data.newLibraryItem) {
        delete this.data.newLibraryItem;
    }
  }

  // --- 4. GÜNCELLEME (SAVE) ---
  saveChanges() {
    const payload = {
        id: this.data.id,
        title: this.data.title,
        description: this.data.description, // 🔥 Açıklama
        trainingSectionId: this.data.trainingSectionId,
        
        // İçerik değişikliği (Yeni varsa yeni ID, yoksa eski ID)
        contentLibraryId: this.data.newLibraryItem ? this.data.newLibraryItem.id : (this.data.contentLibraryId || 0), 
        
        // Ayarlar
        mandatory: this.data.mandatory,
        isPreview: this.data.isPreview,
        allowSeeking: this.data.allowSeeking,   // 🔥 İleri Sarma
        completedRate: this.data.completedRate, // 🔥 Tamamlanma Oranı
        minReadTimeThreshold: this.data.minReadTimeThreshold || 5,
        
        isActive: true
    };

    this.trainingService.updateTrainingContent(payload).subscribe({
        next: (res) => {
            this.toastr.success('Ders başarıyla güncellendi.');
            this.isEditing = false;
            
            // Geçici veriyi temizle
            if(this.data.newLibraryItem) delete this.data.newLibraryItem;

            // 🔥 STORE GÜNCELLEMESİ: Tüm eğitimi backend'den taze çek
            // Böylece liste, ikonlar, süreler vs. %100 güncel olur.
            this.store.dispatch(loadCourse({})); 
        },
        error: (err) => {
            console.error(err);
            this.toastr.error('Güncelleme sırasında hata oluştu.');
        }
    });
  }

  // --- 5. SİLME ---
  deleteContent() {
    if(confirm('Bu içeriği silmek istediğinize emin misiniz?')) {
        this.trainingService.deleteTrainingContent(this.data.id).subscribe({
            next: () => {
                this.toastr.success('İçerik silindi.');
                // Silme işleminden sonra da Store'u tetiklemek en temizidir
                this.store.dispatch(loadCourse({ 
                    courseId: this.data.trainingId // Varsa gönder, yoksa effect store'dan bulur.
                }));
            },
            error: (err) => this.toastr.error('Silme hatası.')
        });
    }
  }
}