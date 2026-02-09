import { Component, Input, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExamApiService } from 'src/app/shared/api/exam-api.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'; // 🔥 EKLENDİ

@Component({
  selector: 'app-exam-builder',
  templateUrl: './exam-builder.component.html',
  styleUrls: ['./exam-builder.component.scss']
})
export class ExamBuilderComponent implements OnInit {
  
  @Input() examId: number | null = null; 

  @ViewChild('imageSelectorModal') imageSelectorModal!: TemplateRef<any>;
  private imageSelectorRef: any; 

  activeTab: 'settings' | 'curriculum' = 'settings';
  isLoading = false;
  
  examForm: FormGroup;
  currentExamDetail: any = null;
  
  // --- VERSİYON YÖNETİMİ ---
  versionList: any[] = []; 
  selectedVersionId: number | null = null; 
  isPublishedVersion = false; 
  
  failureActions = [
      { id: 1, title: 'İşlem Yok (Sıradaki İçeriğe Geç)' },
      { id: 2, title: 'Eğitimi Tekrarla (Başa Dön)' },
      { id: 3, title: 'Bölümü/Konuyu Tekrarla' }
  ];

  // --- MÜFREDAT DEĞİŞKENLERİ ---
  isTopicFormVisible = false;
  topicForm: FormGroup;
  editingTopicId: number | null = null;
  
  // 🔥 EKLENDİ: Hangi topiclerin kapalı olduğunu tutar
  collapsedTopicIds: Set<number> = new Set();

  // Soru Yönetimi
  isQuestionFormVisible = false;
  activeTopicIdForQuestion: number | null = null;
  editingQuestionId: number | null = null;
  questionForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal, 
    private modalService: NgbModal,     
    private fb: FormBuilder,
    private examApi: ExamApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.examForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      examTime: ['00:30:00', Validators.required],
      successRate: [70, [Validators.min(0), Validators.max(100)]],
      passingScore: [50, [Validators.min(0), Validators.max(100)]],
      actionId: [1, Validators.required],
      examStatusId: [1]
    });

    this.topicForm = this.fb.group({
        title: ['', Validators.required],
        seqNumber: [1, Validators.required],
        questionCount: [null],
        imgPath: ['']
    });

    this.questionForm = this.fb.group({
      questionText: ['', Validators.required],
      score: [10, Validators.required],
      options: this.fb.array([])
    });
  }

  ngOnInit(): void {
    if (this.examId && this.examId > 0) {
      this.loadExamData(this.examId);
      this.loadVersionHistory(); 
    }
  }

  // --- SÜRÜKLE BIRAK & AKORDEON İŞLEMLERİ (YENİ) ---

  // Konu yer değiştirince çalışır
  onTopicDrop(event: CdkDragDrop<string[]>) {
    if (!this.currentExamDetail?.activeVersions?.topics) return;

    // 1. Frontend tarafında listeyi güncelle (Anlık görüntü için)
    moveItemInArray(this.currentExamDetail.activeVersions.topics, event.previousIndex, event.currentIndex);

    // 2. Taşınan Topic'i ve Yeni Sırasını bul
    const movedTopic = this.currentExamDetail.activeVersions.topics[event.currentIndex];
    // Sıra numarası 1'den başlar, index 0'dan başlar.
    const newSeqNumber = event.currentIndex + 1; 

    // 3. Backend'e gönder
    const payload = {
        topicId: movedTopic.id,
        newSeqNumber: newSeqNumber
    };

    this.examApi.updateSeqNo(payload).subscribe({
        next: (res: any) => {
            if (!res.header?.result) {
                this.toastr.error('Sıralama güncellenemedi.');
                // Hata olursa eski haline döndürmek gerekebilir (Opsiyonel)
            } else {
                // Backend muhtemelen diğerlerinin sırasını da değiştirdi, 
                // garanti olsun diye veriyi tazeleyelim mi? 
                // Kullanıcı deneyimi kesilmesin diye reload yapmıyorum,
                // sadece localdeki seqNumber'ları düzeltiyorum.
                this.currentExamDetail.activeVersions.topics.forEach((t: any, index: number) => {
                    t.seqNumber = index + 1;
                });
            }
        },
        error: () => {
            this.toastr.error('Sıralama hatası.');
        }
    });
  }

  // Akordeon Aç/Kapa
  toggleTopic(topicId: number) {
      if (this.collapsedTopicIds.has(topicId)) {
          this.collapsedTopicIds.delete(topicId); // Varsa sil (Aç)
      } else {
          this.collapsedTopicIds.add(topicId); // Yoksa ekle (Kapat)
      }
  }

  // Topic kapalı mı kontrolü
  isTopicCollapsed(topicId: number): boolean {
      return this.collapsedTopicIds.has(topicId);
  }

  // --- DİĞER STANDART METOTLAR ---

  openImageSelector() {
    this.imageSelectorRef = this.modalService.open(this.imageSelectorModal, { 
        size: 'xl', centered: true, backdrop: 'static' 
    });
  }

  onImageSelected(path: string) {
    this.topicForm.patchValue({ imgPath: path });
    if (this.imageSelectorRef) this.imageSelectorRef.close();
  }

  onImageSelectionCancel() {
    if (this.imageSelectorRef) this.imageSelectorRef.dismiss();
  }

  switchTab(tab: 'settings' | 'curriculum') {
    if (tab === 'curriculum' && !this.examId) {
      this.toastr.warning('Soru ekleyebilmek için önce genel ayarları kaydetmelisiniz.');
      return;
    }
    this.activeTab = tab;
  }

  loadExamData(examId: number, versionId: number | null = null) {
    this.isLoading = true;
    const payload: any = { examId: examId };
    if(versionId) payload.versionId = versionId;

    this.examApi.getExamDetail(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.header?.result && res.body) {
          this.currentExamDetail = res.body;

          if (this.currentExamDetail.activeVersions?.topics) {
              this.currentExamDetail.activeVersions.topics.sort((a: any, b: any) => {
                  return (a.seqNumber || 0) - (b.seqNumber || 0);
              });
          }
          
          this.examForm.patchValue({
            title: res.body.title,
            description: res.body.description,
            examTime: res.body.activeVersions?.examTimeInMin 
                ? this.convertMinutesToTime(res.body.activeVersions.examTimeInMin) 
                : '00:30:00',
            successRate: res.body.activeVersions?.successRate || 70,
            passingScore: res.body.activeVersions?.passingScore || 50,
            actionId: res.body.actionId || 1,
            examStatusId: res.body.examStatusId || 1
          });

          if (res.body.activeVersions) {
             this.selectedVersionId = res.body.activeVersions.versionId;
             this.isPublishedVersion = res.body.activeVersions.isPublished;
          }
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Sınav bilgileri yüklenemedi.');
      }
    });
  }

  loadVersionHistory() {
      if(!this.examId) return;
      this.examApi.getExamVersions(this.examId).subscribe({
          next: (res: any) => {
              if(res.header?.result) {
                  this.versionList = res.body || [];
              }
          }
      });
  }

  onVersionChange(versionId: number) {
      if(versionId && this.examId) {
          this.loadExamData(this.examId, versionId);
      }
  }

  publishVersion() {
      if(!this.examId || !this.selectedVersionId) return;

      if(confirm('Bu versiyonu YAYINA almak istediğinize emin misiniz? Diğer yayındaki versiyon arşive alınacaktır.')) {
          this.isLoading = true;
          const payload = {
              examId: this.examId,
              versionId: this.selectedVersionId
          };
          
          this.examApi.publishVersion(payload).subscribe({
              next: (res: any) => {
                  this.isLoading = false;
                  if(res.header?.result) {
                      this.toastr.success('Versiyon başarıyla yayına alındı.');
                      this.loadExamData(this.examId!); 
                      this.loadVersionHistory(); 
                  } else {
                      this.toastr.error(res.header?.msg || 'Yayınlama başarısız.');
                  }
              },
              error: () => {
                  this.isLoading = false;
                  this.toastr.error('Hata oluştu.');
              }
          });
      }
  }

  saveSettings() {
    if (this.examForm.invalid) {
      this.toastr.warning('Lütfen zorunlu alanları doldurunuz.');
      return;
    }

    this.isLoading = true;
    const formVal = this.examForm.value;

    if (this.examId) {
      const updatePayload = {
        id: this.examId,
        title: formVal.title,
        description: formVal.description,
        actionId: Number(formVal.actionId),
        versionInfo: {
            id: this.currentExamDetail?.activeVersions?.versionId || 0,
            versionDescription: `${formVal.title} - Güncelleme`, 
            examTime: formVal.examTime,
            succesRate: formVal.successRate,
            passingScore: formVal.passingScore,
            statusId: formVal.examStatusId
        }
      };

      this.examApi.updateExam(updatePayload).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.header?.result) {
            this.toastr.success(res.header.message || 'Sınav güncellendi.');
            this.loadExamData(this.examId!);
            this.loadVersionHistory();
          } else {
             this.toastr.error('Güncelleme başarısız.'); 
          }
        },
        error: (err) => {
            this.isLoading = false; 
            this.toastr.error('Güncelleme hatası.');
        }
      });

    } else {
      const createPayload = {
        title: formVal.title,
        description: formVal.description,
        actionId: Number(formVal.actionId),
        examStatusId: 1,
        versionInfo: {
            versionNumber: 1,
            versionDescription: `${formVal.title} - v1 (Initial)`,
            isPublished: false,
            examTime: formVal.examTime,
            succesRate: formVal.successRate,
            passingScore: formVal.passingScore,
            totalQuestionCount: 0,
            statusId: 1
        }
      };

      this.examApi.addExam(createPayload).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          const newId = res.body?.id || res.body?.Id;

          if (res.header?.result && newId) {
            this.toastr.success('Sınav oluşturuldu.');
            this.examId = newId; 
            this.loadExamData(newId); 
            this.loadVersionHistory();
            this.activeTab = 'curriculum';
            this.cdr.detectChanges(); 
          } else {
             this.toastr.warning('Kayıt yapıldı ancak ID okunamadı.');
          }
        },
        error: () => {
            this.isLoading = false;
            this.toastr.error('Oluşturma hatası.');
        }
      });
    }
  }

  openTopicForm(topic: any = null) {
    this.isTopicFormVisible = true;
    if (topic) {
        this.editingTopicId = topic.id;
        this.topicForm.patchValue({
            title: topic.title,
            seqNumber: topic.seqNumber,
            questionCount: topic.questionCount,
            imgPath: topic.imgPath
        });
    } else {
        this.editingTopicId = null;
        const currentTopics = this.currentExamDetail?.activeVersions?.topics || [];
        const nextSeq = currentTopics.length > 0 
            ? Math.max(...currentTopics.map((t: any) => t.seqNumber || 0)) + 1 
            : 1;

        this.topicForm.reset({
            title: '',
            seqNumber: nextSeq,
            questionCount: null,
            imgPath: ''
        });
    }
  }

  cancelTopicForm() {
    this.isTopicFormVisible = false;
    this.editingTopicId = null;
    this.topicForm.reset();
  }

  saveTopic() {
    if (this.topicForm.invalid) {
        this.toastr.warning('Konu başlığı ve sıra numarası zorunludur.');
        return;
    }

    const versionId = this.currentExamDetail?.activeVersions?.versionId;
    if (!versionId) return;

    this.isLoading = true;
    const formVal = this.topicForm.value;
    const payload = {
        examVersionId: versionId,
        title: formVal.title,
        seqNumber: formVal.seqNumber,
        questionCount: formVal.questionCount,
        imgPath: formVal.imgPath
    };

    if (this.editingTopicId) {
        const updatePayload = { ...payload, id: this.editingTopicId };
        this.examApi.updateExamTopic(updatePayload).subscribe(this.topicResponseHandler);
    } else {
        this.examApi.addExamTopic(payload).subscribe(this.topicResponseHandler);
    }
  }

  private topicResponseHandler = {
    next: (res: any) => {
        if (res.header?.result) {
            this.toastr.success(res.header.message || 'Konu kaydedildi.');
            this.cancelTopicForm();
            this.loadExamData(this.examId!); 
            this.loadVersionHistory();
        } else {
            this.isLoading = false;
            this.toastr.error(res.header?.message || 'İşlem başarısız.');
        }
    },
    error: () => {
        this.isLoading = false;
        this.toastr.error('Hata oluştu.');
    }
  };

  deleteTopic(topicId: number) {
      if(confirm('Bu konuyu silmek istediğinize emin misiniz?')) {
          this.toastr.info('Silme fonksiyonu henüz backend\'e bağlanmadı.');
      }
  }

  get options() { return this.questionForm.get('options') as FormArray; }
  addOption(text = '', isCorrect = false) {
    this.options.push(this.fb.group({ optionText: [text, Validators.required], isCorrect: [isCorrect] }));
  }
  removeOption(index: number) { this.options.removeAt(index); }
  setCorrectOption(index: number) {
    this.options.controls.forEach((ctrl, i) => { ctrl.patchValue({ isCorrect: i === index }); });
  }

  openQuestionForm(topicId: number, question: any = null) {
    this.activeTopicIdForQuestion = topicId;
    this.isQuestionFormVisible = true;
    this.options.clear();

    if (question) {
        this.editingQuestionId = question.id;
        this.questionForm.patchValue({ questionText: question.questionText, score: question.score });
        if (question.options) {
            question.options.forEach((opt: any) => { this.addOption(opt.optionText, opt.isCorrect); });
        }
    } else {
        this.editingQuestionId = null;
        this.questionForm.reset({ score: 10 });
        this.addOption('', true); this.addOption(''); this.addOption(''); this.addOption('');
    }
  }

  cancelQuestionForm() {
    this.isQuestionFormVisible = false;
    this.activeTopicIdForQuestion = null;
    this.editingQuestionId = null;
  }

  saveQuestion() {
    if (this.questionForm.invalid) { this.toastr.warning('Lütfen soru metnini ve şıkları doldurun.'); return; }
    const hasCorrect = this.options.value.some((o: any) => o.isCorrect);
    if (!hasCorrect) { this.toastr.warning('Lütfen doğru cevabı işaretleyin.'); return; }

    this.isLoading = true;
    const formVal = this.questionForm.value;
    const optionsPayload = formVal.options.map((o: any) => ({ optionText: o.optionText, isCorrect: o.isCorrect }));

    if (this.editingQuestionId) {
        const payload = {
            id: this.editingQuestionId,
            examTopicId: this.activeTopicIdForQuestion,
            questionText: formVal.questionText,
            score: formVal.score,
            questionOptions: optionsPayload
        };
        this.examApi.updateExamQuestion(payload).subscribe(this.questionResponseHandler);
    } else {
        const payload = {
            examTopicId: this.activeTopicIdForQuestion,
            questionText: formVal.questionText,
            score: formVal.score,
            questionOptions: optionsPayload
        };
        this.examApi.addExamQuestion(payload).subscribe(this.questionResponseHandler);
    }
  }

  private questionResponseHandler = {
    next: (res: any) => {
        if (res.header?.result) {
            this.toastr.success(res.header.message || 'Soru kaydedildi.');
            this.cancelQuestionForm();
            this.loadExamData(this.examId!);
            this.loadVersionHistory();
        } else {
            this.isLoading = false;
            this.toastr.error(res.header?.message || 'İşlem başarısız.');
        }
    },
    error: () => {
        this.isLoading = false;
        this.toastr.error('Hata oluştu.');
    }
  };

  deleteQuestion(questionId: number) {
      if(confirm('Soruyu silmek istiyor musunuz?')) {
          this.toastr.info('Silme fonksiyonu backend\'e bağlanmalı.');
      }
  }

  close() {
    this.activeModal.close(this.examId ? true : false);
  }

  private convertMinutesToTime(totalMinutes: number): string {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      const seconds = Math.floor((totalMinutes * 60) % 60);
      return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }
  private pad(num: number): string { return num < 10 ? '0' + num : num.toString(); }
}