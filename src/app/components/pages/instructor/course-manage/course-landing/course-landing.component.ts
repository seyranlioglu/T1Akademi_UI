import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Editor, Toolbar, toHTML } from 'ngx-editor';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { TypesApiService } from 'src/app/shared/api/types-api.service';
import { CourseState, selectSelectedCourse } from 'src/app/shared/store/course.reducer';
import { loadCourse } from 'src/app/shared/store/course.actions';

// 🔥 DEĞİŞİKLİK 1: PrimeNG gitti, Toastr geldi
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-course-landing',
  templateUrl: './course-landing.component.html',
  styleUrls: ['./course-landing.component.scss']
  // providers: [MessageService] <-- SİLİNDİ: Toastr için buna gerek yok
})
export class CourseLandingComponent implements OnInit, OnDestroy {

  course: any = null;
  form!: FormGroup;
  isSaving: boolean = false;
  private destroy$ = new Subject<void>();

  // Editor Ayarları
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'], ['underline', 'strike'], ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'], [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  // Dropdown Data
  languages: any[] = [];
  levels: any[] = [];
  allCategories: any[] = [];
  mainCategories: any[] = [];
  subCategories: any[] = [];
  selectedMainCategoryId: number | null = null;

  // Medya
  previewImage: string | null = null;
  previewVideo: string | null = null;
  showSelector = false;
  activeSelectorType: 'image' | 'video' = 'image';

  constructor(
    private fb: FormBuilder,
    // 🔥 DEĞİŞİKLİK 2: MessageService yerine ToastrService inject edildi
    private toastr: ToastrService, 
    private sanitizer: DomSanitizer,
    private trainingApi: TrainingApiService,
    private typeService: TypesApiService,
    private store: Store<{ course: CourseState }>
  ) { }

  ngOnInit(): void {
    this.editor = new Editor();
    this.initForm();
    this.loadDropdowns();

    this.store.select(selectSelectedCourse)
      .pipe(takeUntil(this.destroy$))
      .subscribe(courseData => {
        if (courseData) {
            this.course = courseData;
            this.updateFormValues();
        }
      });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(60)]],
      subTitle: ['', [Validators.maxLength(120)]],
      description: ['', [Validators.required]],
      languageId: [null, [Validators.required]],
      levelId: [null, [Validators.required]],
      categoryId: [null, [Validators.required]],
      headerImage: [''],
      trailer: ['']
    });
  }

  loadDropdowns() {
    this.typeService.getLanguages().subscribe({
        next: (res) => { this.languages = Array.isArray(res) ? res : (res.data || []); },
        error: (err) => console.error("Diller yüklenemedi", err)
    });

    this.typeService.getLevels().subscribe({
        next: (res) => { this.levels = Array.isArray(res) ? res : (res.data || []); },
        error: (err) => console.error("Seviyeler yüklenemedi", err)
    });

    this.typeService.getCategories().subscribe({
        next: (res) => {
            const data = res.body || res.data || res;
            if (Array.isArray(data)) {
                this.allCategories = data;
                this.mainCategories = this.allCategories; 
                if (this.course && this.course.categoryId) {
                    this.findAndSetCategory(this.course.categoryId);
                }
            }
        },
        error: (err) => console.error("Kategoriler yüklenemedi", err)
    });
  }

  updateFormValues() {
    if (!this.course) return;

    const lvlIdRaw = this.course.trainingLevelId ?? this.course.levelId;
    const langId = (this.course.trainingLanguageId > 0) ? this.course.trainingLanguageId : null;
    const lvlId = (lvlIdRaw > 0) ? lvlIdRaw : null;

    this.form.patchValue({
      title: this.course.title,
      subTitle: this.course.subTitle,
      description: this.course.description,
      languageId: langId,
      levelId: lvlId,
      headerImage: this.course.headerImage,
      trailer: this.course.trailer
    });

    this.previewImage = this.course.headerImage || null;
    this.previewVideo = this.course.trailer || null;

    if (this.allCategories.length > 0 && this.course.categoryId) {
        this.findAndSetCategory(this.course.categoryId);
    }
  }

  findAndSetCategory(targetSubId: number) {
      const isMain = this.allCategories.find(c => c.id === targetSubId);
      if(isMain) {
          this.selectedMainCategoryId = isMain.id;
          this.subCategories = isMain.subCategories || [];
          this.form.patchValue({ categoryId: isMain.id });
          return;
      }

      for (const parent of this.allCategories) {
          if (parent.subCategories && parent.subCategories.length > 0) {
              const child = parent.subCategories.find((c: any) => c.id === targetSubId);
              if (child) {
                  this.selectedMainCategoryId = parent.id;
                  this.subCategories = parent.subCategories;
                  this.form.patchValue({ categoryId: child.id });
                  return;
              }
          }
      }
  }

  onMainCategoryChange(event: any) {
    const mainCatId = Number(event);
    this.selectedMainCategoryId = mainCatId;
    this.subCategories = []; 
    this.form.patchValue({ categoryId: null });

    const selectedCat = this.allCategories.find(c => c.id === mainCatId);
    if (selectedCat && selectedCat.subCategories) {
      this.subCategories = selectedCat.subCategories;
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      
      const invalidControls = [];
      for (const name in this.form.controls) {
          if (this.form.controls[name].invalid) {
              let fieldName = name;
              if(name === 'title') fieldName = 'Kurs Başlığı';
              if(name === 'description') fieldName = 'Açıklama';
              if(name === 'levelId') fieldName = 'Seviye';
              if(name === 'languageId') fieldName = 'Dil';
              if(name === 'categoryId') fieldName = 'Kategori';
              invalidControls.push(fieldName);
          }
      }

      // 🔥 DEĞİŞİKLİK 3: Toastr warning kullanımı
      this.toastr.warning(
        `Lütfen şu alanları kontrol ediniz: ${invalidControls.join(', ')}`, 
        'Eksik Bilgiler'
      );
      
      return; 
    }

    if (!this.course || !this.course.id) {
       // 🔥 DEĞİŞİKLİK 4: Toastr error
       this.toastr.error('Eğitim verisi bulunamadı.', 'Hata');
       return;
    }

    this.isSaving = true;
    const formVal = this.form.value;

    let descriptionHtml = "";
    try {
        if (formVal.description && typeof formVal.description === 'object') {
            descriptionHtml = toHTML(formVal.description);
        } else if (typeof formVal.description === 'string') {
            descriptionHtml = formVal.description;
        }
    } catch (e) {
        console.error("Editör verisi dönüştürülemedi", e);
    }

    const updateDto = {
      id: this.course.id,
      title: formVal.title,
      subTitle: formVal.subTitle,
      description: descriptionHtml,
      languageId: Number(formVal.languageId),
      levelId: Number(formVal.levelId),
      categoryId: Number(formVal.categoryId),
      headerImage: formVal.headerImage,
      trailer: formVal.trailer
    };

    this.trainingApi.updateCourseLanding(updateDto).subscribe({
      next: (res) => {
        const responseData = res.body || res;
        
        if (responseData && (responseData.result === true || responseData.success === true)) {
            // 🔥 DEĞİŞİKLİK 5: Toastr success
            this.toastr.success('Vitrin bilgileri güncellendi.', 'Başarılı');
            this.store.dispatch(loadCourse({ courseId: this.course.id }));
        } else {
            // 🔥 DEĞİŞİKLİK 6: Toastr error
            this.toastr.error(responseData.message || 'Kaydetme başarısız.', 'Hata');
        }
        this.isSaving = false;
      },
      error: (err) => {
        console.error(err);
        // 🔥 DEĞİŞİKLİK 7: Toastr error
        this.toastr.error('Sunucu hatası.', 'Hata');
        this.isSaving = false;
      }
    });
  }

  openSelector(type: 'image' | 'video') { this.activeSelectorType = type; this.showSelector = true; }
  closeSelector() { this.showSelector = false; }
  
  onFileSelected(filePath: string) {
    if (this.activeSelectorType === 'image') {
      this.form.patchValue({ headerImage: filePath });
      this.previewImage = filePath;
      this.toastr.info('Görsel seçildi.'); // Ufak bir bildirim
    } else {
      this.form.patchValue({ trailer: filePath });
      this.previewVideo = filePath;
      this.toastr.info('Video seçildi.');
    }
    this.showSelector = false;
  }
  
  isYoutube(url: string | null): boolean { if (!url) return false; return url.includes('youtube.com') || url.includes('youtu.be'); }
  
  getYoutubeEmbedUrl(url: string | null): SafeResourceUrl { 
      if (!url) return ''; let videoId = ''; 
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/); 
      if (match && match[1]) videoId = match[1]; 
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${videoId}`);
  }
  
  get f() { return this.form.controls; }
}