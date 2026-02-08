import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExamApiService } from 'src/app/shared/api/exam-api.service';

@Component({
  selector: 'app-exam-builder',
  templateUrl: './exam-builder.component.html',
  styleUrls: ['./exam-builder.component.scss']
})
export class ExamBuilderComponent implements OnInit {
  
  @Input() examId: number | null = null; 

  activeTab: 'settings' | 'curriculum' = 'settings';
  isLoading = false;
  
  examForm: FormGroup;
  
  currentExamDetail: any = null;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private examApi: ExamApiService,
    private toastr: ToastrService
  ) {
    this.examForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      examTime: ['00:30:00'],
      successRate: [70],
      passingScore: [50],
      actionId: [1],
      examStatusId: [1]
    });
  }

  ngOnInit(): void {
    if (this.examId && this.examId > 0) {
      this.loadExamData(this.examId);
    }
  }

  switchTab(tab: 'settings' | 'curriculum') {
    if (tab === 'curriculum' && !this.examId) {
      this.toastr.warning('Soru ekleyebilmek için önce genel ayarları kaydetmelisiniz.');
      return;
    }
    this.activeTab = tab;
  }

  loadExamData(id: number) {
    this.isLoading = true;
    this.examApi.getExamDetail({ examId: id }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.result) {
          this.currentExamDetail = res.body;
          this.examForm.patchValue({
            title: res.body.title,
            description: res.body.description,
            examTime: res.body.activeVersions?.examTime || '00:30:00',
            successRate: res.body.activeVersions?.successRate || 70,
            passingScore: res.body.activeVersions?.passingScore || 50,
            actionId: res.body.actionId || 1,
            examStatusId: res.body.examStatusId || 1
          });
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Sınav bilgileri yüklenemedi.');
      }
    });
  }

  saveSettings() {
    if (this.examForm.invalid) {
      this.toastr.warning('Lütfen zorunlu alanları doldurunuz.');
      return;
    }

    this.isLoading = true;
    const formVal = this.examForm.value;

    if (this.examId) {
      // --- GÜNCELLEME (UPDATE) ---
      const updatePayload = {
        id: this.examId,
        title: formVal.title,
        description: formVal.description,
        actionId: formVal.actionId,
        versionInfo: {
            id: this.currentExamDetail?.activeVersions?.versionId || 0,
            
            // GÜNCELLEME: Versiyon açıklamasını da gönderiyoruz
            versionDescription: `${formVal.title} - Güncelleme`, 
            
            examTime: formVal.examTime,
            succesRate: formVal.successRate,
            passingScore: formVal.passingScore,
            statusId: formVal.examStatusId
        }
      };

      this.examApi.updateExam(updatePayload).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.result) {
            this.toastr.success('Sınav güncellendi.');
          }
        },
        error: (err) => {
            this.isLoading = false; 
            console.error(err);
            this.toastr.error('Güncelleme hatası.');
        }
      });

    } else {
      // --- YENİ OLUŞTURMA (CREATE) ---
      
      // DÜZELTME: Otomatik Versiyon Açıklaması Ekledik
      const autoVersionDesc = `${formVal.title} - v1 (Initial)`;

      const createPayload = {
        title: formVal.title,
        description: formVal.description,
        actionId: formVal.actionId,
        examStatusId: 1, // Taslak
        versionInfo: {
            versionNumber: 1,
            versionDescription: autoVersionDesc, // 🔥 EKLENEN ALAN
            isPublished: false,
            examTime: formVal.examTime,
            succesRate: formVal.successRate,
            passingScore: formVal.passingScore,
            totalQuestionCount: 0,
            statusId: 1
        }
      };

      this.examApi.addExam(createPayload).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.result && res.body.id) {
            this.toastr.success('Sınav oluşturuldu. Şimdi soru ekleyebilirsiniz.');
            
            const newExamId = res.body.id;
            this.examId = newExamId; 
            
            this.loadExamData(newExamId); 
            
            this.activeTab = 'curriculum';
          }
        },
        error: (err) => {
            this.isLoading = false;
            console.error(err);
            // Backend validasyon hatalarını gösterelim
            if(err.error?.errors) {
               // Hata objesini string'e çevirip basalım veya ilk hatayı gösterelim
               const firstError = Object.values(err.error.errors)[0];
               this.toastr.error(Array.isArray(firstError) ? firstError[0] : 'Validasyon hatası');
            } else {
               this.toastr.error('Oluşturma hatası.');
            }
        }
      });
    }
  }

  close() {
    this.activeModal.close(this.examId ? true : false);
  }
}