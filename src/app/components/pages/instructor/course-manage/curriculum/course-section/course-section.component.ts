import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { loadCourse } from 'src/app/shared/store/course.actions';
import { ContentLibrarySelectorComponent } from 'src/app/components/common/content-library-selector/content-library-selector.component';

@Component({
  selector: 'app-course-section',
  templateUrl: './course-section.component.html',
  styleUrls: ['./course-section.component.scss'],
  providers: [DialogService]
})
export class CourseSectionComponent {
  
  // Gelen data: { trainingSectionId, trainingSectionTitle, trainingSectionRowNumber... }
  @Input() data: any;   
  @Input() index!: number; 
  @Output() contentDropped = new EventEmitter<any>();

  isExpanded = true;
  sectionTitleEdit = false;
  
  // --- YENİ DERS KARTI DEĞİŞKENLERİ ---
  isNewContentFormVisible = false;
  newContentTitle: string = '';
  newContentType: 'material' | 'exam' = 'material'; 
  selectedLibraryItem: any = null; 
  selectedExamItem: any = null;    

  // Ayarlar
  contentSettings = {
      mandatory: true, isPreview: false, allowSeeking: true, 
      completedRate: 95, minReadTimeThreshold: 5   
  };

  isSettingsDialogVisible = false;
readonly CONTENT_TYPE_LECTURE_CODE = 'lec'; 
  readonly CONTENT_TYPE_EXAM_CODE = 'exm';
  ref: DynamicDialogRef | undefined;

  constructor(
    private dialogService: DialogService,
    private trainingService: TrainingApiService,
    private store: Store,
    private toastr: ToastrService
  ) {}

  toggleExpand() { this.isExpanded = !this.isExpanded; }

  // --- FORM İŞLEMLERİ ---
  toggleNewContentForm() {
    this.isNewContentFormVisible = !this.isNewContentFormVisible;
    if(this.isNewContentFormVisible) this.resetForm();
  }

  resetForm() {
    this.newContentTitle = '';
    this.newContentType = 'material';
    this.selectedLibraryItem = null;
    this.selectedExamItem = null;
    this.contentSettings = { mandatory: true, isPreview: false, allowSeeking: true, completedRate: 95, minReadTimeThreshold: 5 };
  }

  // --- İÇERİK SEÇİMİ ---
  openLibrarySelector() {
    this.ref = this.dialogService.open(ContentLibrarySelectorComponent, {
      header: 'Kütüphaneden İçerik Seç',
      width: '70%',
      contentStyle: { 'max-height': '600px', 'overflow': 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true
    });

    this.ref.onClose.subscribe((selectedContent: any) => {
      if (selectedContent) {
        this.selectedLibraryItem = selectedContent;
        if (!this.newContentTitle) this.newContentTitle = selectedContent.title || selectedContent.fileName;
      }
    });
  }

  openExamSelector() {
    alert("Sınav seçici modülü hazırlanıyor...");
  }

  // --- KAYDET ---
  saveContent() {
    if (!this.newContentTitle.trim()) {
        this.toastr.warning('Lütfen ders başlığı giriniz.');
        return;
    }
    if (this.newContentType === 'material' && !this.selectedLibraryItem) {
        this.toastr.warning('Lütfen kütüphaneden bir içerik seçiniz.');
        return;
    }

    // 🔥 DÜZELTME: trainingSectionId kullanımı
    const sectionId = this.data.trainingSectionId || this.data.id;

    const payload = {
      trainingSectionId: sectionId, 
      title: this.newContentTitle,
      isActive: true,
      contentTypeCode: this.newContentType === 'exam' ? this.CONTENT_TYPE_EXAM_CODE : this.CONTENT_TYPE_LECTURE_CODE,
      contentLibraryId: this.newContentType === 'material' ? this.selectedLibraryItem.id : null,
      examId: this.newContentType === 'exam' ? this.selectedExamItem?.id : null,
      mandatory: this.contentSettings.mandatory,
      isPreview: this.contentSettings.isPreview,
      allowSeeking: this.contentSettings.allowSeeking,
      completedRate: this.contentSettings.completedRate,
      minReadTimeThreshold: this.contentSettings.minReadTimeThreshold
    };

    this.trainingService.addTrainingContent(payload).subscribe({
      next: (res) => {
        this.toastr.success('Ders başarıyla eklendi.');
        this.toggleNewContentForm();
        this.store.dispatch(loadCourse({}));
      },
      error: (err) => {
        console.error("Hata:", err);
        this.toastr.error('Ders eklenirken hata oluştu.');
      }
    });
  }

  // --- BÖLÜM İŞLEMLERİ ---
  deleteSection() {
    // 🔥 DÜZELTME: trainingSectionId kullanımı
    const sectionId = this.data.trainingSectionId || this.data.id;

    if(confirm('Bu bölümü ve içindeki tüm dersleri silmek istediğinize emin misiniz?')) {
        this.trainingService.deleteTrainingSection(sectionId).subscribe({
            next: () => this.store.dispatch(loadCourse({})),
            error: (err) => console.error(err)
        });
    }
  }

  updateSectionTitle() {
      this.sectionTitleEdit = false;
      
      // 🔥 DÜZELTME: trainingSectionTitle kullanımı
      // Data yapısı karmaşık olduğu için her iki ihtimali de (camelCase / PascalCase) kontrol edelim
      const currentTitle = this.data.trainingSectionTitle || this.data.title;
      const sectionId = this.data.trainingSectionId || this.data.id;
      const rowNumber = this.data.trainingSectionRowNumber ?? this.data.rowNumber ?? this.index;
      // TrainingId genelde section içinde gelmeyebilir, parent'tan veya state'den alınmalı.
      // Eğer data içinde yoksa null gönderiyoruz, backend umarım bunu handle ediyordur.
      const trainingId = this.data.trainingId; 

      if (!currentTitle || currentTitle.trim().length === 0) {
          this.toastr.warning('Bölüm başlığı boş olamaz.');
          return;
      }

      const payload = {
          id: sectionId,
          title: currentTitle,
          rowNumber: rowNumber,
          trainingId: trainingId, 
          description: this.data.trainingSectionDescription || this.data.description,
          isActive: true, 
          langCode: 'tr'
      };

      // console.log("Update Payload:", payload); // Debug için

      this.trainingService.updateTrainingSection(payload).subscribe({
          next: () => {
             // this.toastr.success('Başlık güncellendi');
          },
          error: (err) => {
              console.error("Başlık güncellenemedi", err);
              this.toastr.error('Güncelleme başarısız.');
          }
      });
  }
}