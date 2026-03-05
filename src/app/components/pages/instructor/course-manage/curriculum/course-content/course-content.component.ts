import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';

import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { ContentPreviewModalComponent } from 'src/app/components/common/modals/content-preview-modal/content-preview-modal.component';
import { ContentLibrarySelectorComponent } from 'src/app/components/common/content-library-selector/content-library-selector.component';
import { loadCourse } from 'src/app/shared/store/course.actions';

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

  tempSelectedExamId: number | null = null;

  constructor(
    private dialogService: DialogService,
    private trainingService: TrainingApiService,
    private toastr: ToastrService,
    private store: Store
  ) {}

  // 🔥 YENİ: İçerik tipini dinamik olarak tespit etme
  get fileCategory(): 'video' | 'document' | 'exam' {
      if (this.data.contentType?.code === 'exm') return 'exam';
      
      const name = (this.data.newLibraryItem?.fileName 
                    || this.data.contentLibrary?.fileName 
                    || this.data.contentLibrary?.FileName 
                    || this.data.trainingContentLibraryDto?.trainingContentLibraryFileName 
                    || '').toLowerCase();
      
      if (name.match(/\.(mp4|avi|mov|mkv|webm)$/) || name.includes('youtube')) return 'video';
      if (name.match(/\.(pdf|jpg|jpeg|png|gif|webp)$/)) return 'document';
      
      return 'video'; // Fallback
  }

  getIconClass(item: any): string {
    if (!item) return 'bx-error text-muted';
    if (item.contentType?.code === 'exm') return 'bx-task text-warning';
    
    const lib = item.contentLibrary || item.trainingContentLibraryDto || {};
    const fileName = (lib.FileName || lib.fileName || lib.trainingContentLibraryFileName || item.title || '').toLowerCase();
    
    if (fileName.endsWith('.pdf')) return 'bxs-file-pdf text-danger';
    if (fileName.match(/\.(jpeg|jpg|png|gif|webp)$/)) return 'bxs-image text-success';
    if (fileName.match(/\.(doc|docx)$/)) return 'bxs-file-doc text-primary';
    
    return 'bx-video text-primary'; 
  }

  openPreview() {
    if (this.data.contentType?.code === 'exm') {
        this.toastr.info('Sınav önizlemesi için düzenleme modunu kullanabilirsiniz.');
        return;
    }

    const lib = this.data.contentLibrary || this.data.trainingContentLibraryDto || {};
    
    const modalData = {
        id: lib.Id || lib.id || this.data.contentLibraryId,
        filePath: lib.FilePath || lib.filePath || lib.trainingContentLibraryFilePath || this.data.filePath,
        fileName: lib.FileName || lib.fileName || lib.trainingContentLibraryFileName || this.data.title || 'İçerik',
        title: this.data.title || lib.FileName,
        description: this.data.description,
        fileType: lib.FileType || lib.fileType,
        thumbnail: lib.Thumbnail || lib.thumbnail || lib.trainingContentLibraryThumbnail,
        videoDuration: lib.VideoDuration || lib.videoDuration || lib.trainingContentLibraryVideoDuration,
        documentFileSize: lib.DocumentFileSize || lib.documentFileSize || lib.trainingContentLibraryDocumentFileSize,
        content: this.data 
    };

    if (!modalData.filePath) {
        this.toastr.warning('Bu dersin dosya yolu bulunamadı.', 'Dosya Yok');
        return;
    }

    this.dialogService.open(ContentPreviewModalComponent, {
        header: modalData.title,
        width: '80%',
        height: 'auto',
        baseZIndex: 10002,
        modal: true,
        dismissableMask: true,
        data: modalData
    });
  }

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
            this.data.newLibraryItem = selectedContent; 
            this.data.contentLibraryId = selectedContent.id; 
            this.toastr.info(`"${selectedContent.fileName}" seçildi. Kaydetmeyi unutmayın.`);
        }
    });
  }

  onExamSelected(exam: any) {
      if (exam && exam.examId) {
          this.tempSelectedExamId = exam.examId;
      }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
        if (this.data.newLibraryItem) delete this.data.newLibraryItem;
        this.tempSelectedExamId = null;
    } else {
        if (this.data.minReadTimeThreshold == null) this.data.minReadTimeThreshold = 10;
        if (this.data.completedRate == null) this.data.completedRate = 95;
    }
  }

  // --- 5. GÜNCELLEME (SAVE) ---
  saveChanges() {
    const isExam = this.data.contentType?.code === 'exm';
    const targetContentId = isExam 
        ? (this.tempSelectedExamId || this.data.examId) 
        : (this.data.newLibraryItem ? this.data.newLibraryItem.id : (this.data.contentLibraryId || 0));

    const cat = this.fileCategory;

    const payload = {
        id: this.data.id,
        title: this.data.title,
        description: this.data.description,
        trainingSectionId: this.data.trainingSectionId,
        
        contentLibraryId: isExam ? null : targetContentId,
        examId: isExam ? targetContentId : null,
        
        mandatory: this.data.mandatory,
        isPreview: this.data.isPreview,
        
        // 🔥 İçerik Tipine Göre Alanları Yolla
        allowSeeking: cat === 'video' ? this.data.allowSeeking : null,
        completedRate: cat === 'video' ? this.data.completedRate : null,
        minReadTimeThreshold: cat === 'document' ? this.data.minReadTimeThreshold : null,
        
        isActive: this.data.isActive // Backend Smart Update bunu yönetecek
    };

    this.trainingService.updateTrainingContent(payload).subscribe({
        next: (res: any) => {
            this.toastr.success(res.message || 'Ders başarıyla güncellendi.');
            this.isEditing = false;
            
            if(this.data.newLibraryItem) delete this.data.newLibraryItem;
            this.tempSelectedExamId = null;

            this.store.dispatch(loadCourse({})); 
        },
        error: (err) => {
            console.error(err);
            this.toastr.error('Güncelleme sırasında hata oluştu.');
        }
    });
  }

  deleteContent() {
    if(confirm('Bu içeriği silmek istediğinize emin misiniz?')) {
        this.trainingService.deleteTrainingContent(this.data.id).subscribe({
            next: () => {
                this.toastr.success('İçerik silindi.');
                this.store.dispatch(loadCourse({ courseId: this.data.trainingId }));
            },
            error: (err) => this.toastr.error('Silme hatası.')
        });
    }
  }
}