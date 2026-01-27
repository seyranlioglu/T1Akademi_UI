import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ContentLibraryApiService } from 'src/app/shared/api/content-library-api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-content-preview-modal',
  templateUrl: './content-preview-modal.component.html',
  styleUrls: ['./content-preview-modal.component.scss']
})
export class ContentPreviewModalComponent implements OnInit {
  
  data: any;
  // DÜZELTME BURADA: (!) işareti ile initialize hatasını çözüyoruz
  editForm!: FormGroup; 
  loading = false;
  
  fullPath: string = '';
  isVideo = false;
  isPdf = false;
  imageBaseUrl = environment.apiUrl.replace('/api', '');

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private contentService: ContentLibraryApiService
  ) {
    this.data = this.config.data;
  }

  ngOnInit(): void {
    this.setupFile();
    this.initForm();
  }

  setupFile() {
    if (this.data.filePath) {
      const cleanPath = this.data.filePath.replace(/\\/g, '/');
      this.fullPath = `${this.imageBaseUrl}/${cleanPath}`;
      
      const ext = this.data.fileName?.split('.').pop()?.toLowerCase();
      if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {
        this.isVideo = true;
      } else if (ext === 'pdf') {
        this.isPdf = true;
      }
    }
  }

  initForm() {
    this.editForm = this.fb.group({
      // Title yoksa fileName kullan
      title: [this.data.title || this.data.fileName, Validators.required],
      description: [this.data.description || '']
    });
  }

  saveChanges() {
    if (this.editForm.invalid) return;

    this.loading = true;
    const formVal = this.editForm.value;

    this.contentService.updateContent(this.data.id, formVal).subscribe({
      next: (res: any) => {
        if (res?.header?.result) {
          this.ref.close(true); // Başarılı, true dön
        } else {
          // Hata mesajı eklenebilir
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}