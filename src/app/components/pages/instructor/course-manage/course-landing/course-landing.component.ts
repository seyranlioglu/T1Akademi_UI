import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Editor, Toolbar } from 'ngx-editor'; 
import { GetTraining } from 'src/app/shared/models/get-training.model';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TrainingApiService } from 'src/app/shared/api/training-api.service'; // API Service Eklendi

@Component({
  selector: 'app-course-landing',
  templateUrl: './course-landing.component.html',
  styleUrls: ['./course-landing.component.scss'],
  providers: [MessageService] 
})
export class CourseLandingComponent implements OnInit, OnChanges, OnDestroy { // OnChanges Eklendi

  @Input() course: GetTraining | null = null;
  form!: FormGroup;
  isSaving: boolean = false; // Kaydetme durumu
  
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  previewImage: string | null = null;
  previewVideo: string | null = null;

  showSelector = false;
  activeSelectorType: 'image' | 'video' = 'image';

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    private trainingApi: TrainingApiService // Servis inject edildi
  ) { }

  ngOnInit(): void {
    this.editor = new Editor();
    this.initForm();
    // İlk yüklemede veri varsa doldur (Genelde boştur, OnChanges çalışır)
    if (this.course) this.updateFormValues();
  }

  // 🔥 YENİ: Veri sonradan gelirse (Async) burası yakalar ve formu doldurur
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['course'] && changes['course'].currentValue) {
      this.updateFormValues();
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  initForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(60)]],
      subtitle: ['', [Validators.maxLength(120)]],
      description: ['', [Validators.required]], 
      languageId: [null, [Validators.required]],
      levelId: [null, [Validators.required]],
      categoryId: [null, [Validators.required]],
      headerImage: [''],
      trailer: ['']
    });
  }

  updateFormValues() {
    if (!this.course) return;
    
    this.form.patchValue({
      title: this.course.title,
      // subtitle modelde yoksa description'dan veya boş geçebiliriz, şimdilik boş
      description: this.course.description,
      languageId: (this.course as any).trainingLanguageId || (this.course as any).languageId, 
      levelId: (this.course as any).trainingLevelId || (this.course as any).levelId,       
      categoryId: this.course.categoryId,
      headerImage: this.course.headerImage,
      trailer: (this.course as any).trailer || (this.course as any).previewVideoPath
    });

    this.previewImage = this.course.headerImage || null;
    this.previewVideo = (this.course as any).trailer || (this.course as any).previewVideoPath || null;
  }

  // --- KAYDETME İŞLEMİ ---
  save() {
    if (this.form.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Eksik Bilgiler', detail: 'Lütfen zorunlu alanları doldurunuz.' });
      this.form.markAllAsTouched();
      return;
    }

    if (!this.course || !this.course.id) {
      this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Eğitim ID bulunamadı.' });
      return;
    }

    this.isSaving = true;
    
    // Backend'in beklediği DTO yapısını oluşturuyoruz
    const updateDto = {
      id: this.course.id,
      ...this.form.value // Formdaki tüm alanları al
    };

    this.trainingApi.updateTraining(updateDto).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Eğitim bilgileri güncellendi.' });
        this.isSaving = false;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Güncelleme sırasında bir sorun oluştu.' });
        this.isSaving = false;
      }
    });
  }

  // --- Yardımcı Metodlar ---
  openSelector(type: 'image' | 'video') {
    this.activeSelectorType = type;
    this.showSelector = true;
  }

  closeSelector() {
    this.showSelector = false;
  }

  onFileSelected(filePath: string) {
    if (this.activeSelectorType === 'image') {
      this.form.patchValue({ headerImage: filePath });
      this.previewImage = filePath;
      this.messageService.add({ severity: 'success', summary: 'Görsel Seçildi' });
    } else {
      this.form.patchValue({ trailer: filePath });
      this.previewVideo = filePath;
      this.messageService.add({ severity: 'success', summary: 'Video Seçildi' });
    }
    this.showSelector = false;
  }

  isYoutube(url: string | null): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getYoutubeEmbedUrl(url: string | null): SafeResourceUrl {
    if (!url) return '';
    let videoId = '';
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (match && match[1]) videoId = match[1];
    
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  get f() { return this.form.controls; }
}