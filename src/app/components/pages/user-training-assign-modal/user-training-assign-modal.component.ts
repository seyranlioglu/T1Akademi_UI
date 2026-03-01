import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { CurrAccTrainingApiService, CompanyLibraryForAssignDto } from 'src/app/shared/api/curr-acc-training-api.service';

@Component({
  selector: 'app-user-training-assign-modal',
  templateUrl: './user-training-assign-modal.component.html',
  styleUrls: ['./user-training-assign-modal.component.scss']
})
export class UserTrainingAssignModalComponent implements OnInit {

  @Input() userId!: number;
  @Input() userName!: string;

  library: CompanyLibraryForAssignDto[] = [];
  alreadyAssignedIds: number[] = [];
  selectedTrainingIds: Set<number> = new Set<number>();

  isLoading = true;
  isSaving = false;
  
  // Akordeon ve Uyarı Kontrolleri
  expandedRowId: number | null = null;
  showEndlessWarning: boolean = false;
  
  assignForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private currAccTrainingService: CurrAccTrainingApiService
  ) {
    this.assignForm = this.fb.group({
      startDate: [null],
      dueDate: [null]
    });
  }

  ngOnInit(): void {
    // Modal açıldığında başlangıç tarihini "Bugün" olarak set et
    const today = new Date();
    // Zaman dilimi (timezone) kaymasını önlemek için yerel tarihi YYYY-MM-DD formatına çeviriyoruz
    const localDateStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    this.assignForm.patchValue({
        startDate: localDateStr
    });

    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    forkJoin({
      libraryRes: this.currAccTrainingService.getCompanyLibraryForAssign(),
      assignedRes: this.currAccTrainingService.getUserAssignedTrainingIds(this.userId)
    }).subscribe({
      next: ({ libraryRes, assignedRes }) => {
        if (libraryRes.header.result) {
          this.library = libraryRes.body || [];
        }
        if (assignedRes.header.result) {
          this.alreadyAssignedIds = assignedRes.body || [];
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Veriler yüklenirken bir hata oluştu.');
        this.isLoading = false;
        this.activeModal.dismiss();
      }
    });
  }

  // --- AKORDEON MANTIĞI ---
  toggleAccordion(trainingId: number) {
    this.expandedRowId = this.expandedRowId === trainingId ? null : trainingId;
  }

  // --- SEÇİM (CHECKBOX) MANTIĞI ---
  toggleSelection(event: Event, trainingId: number) {
    event.stopPropagation(); // Checkbox'a tıklayınca akordeonun açılıp kapanmasını engeller
    if (this.alreadyAssignedIds.includes(trainingId)) return;

    if (this.selectedTrainingIds.has(trainingId)) {
      this.selectedTrainingIds.delete(trainingId);
    } else {
      this.selectedTrainingIds.add(trainingId);
    }
  }

  isSelected(trainingId: number): boolean {
    return this.selectedTrainingIds.has(trainingId);
  }

  isAssigned(trainingId: number): boolean {
    return this.alreadyAssignedIds.includes(trainingId);
  }

  // --- KAYDETME VE UYARI MANTIĞI ---
  attemptSave() {
    if (this.selectedTrainingIds.size === 0) {
      this.toastr.warning('Lütfen atanacak en az bir eğitim seçiniz.');
      return;
    }

    const formVals = this.assignForm.value;
    
    // Bitiş tarihi boşsa şık uyarıyı göster
    if (!formVals.dueDate) {
      this.showEndlessWarning = true;
    } else {
      // Doluysa direkt kaydet
      this.confirmAndSave();
    }
  }

  cancelWarning() {
    this.showEndlessWarning = false;
  }

  confirmAndSave() {
    this.showEndlessWarning = false;
    this.isSaving = true;
    const formVals = this.assignForm.value;

    const payload = {
      userId: this.userId,
      currAccTrainingIds: Array.from(this.selectedTrainingIds),
      startDate: formVals.startDate,
      dueDate: formVals.dueDate
    };

    this.currAccTrainingService.assignUserToTrainings(payload).subscribe({
      next: (res) => {
        if (res.header.result) {
          this.toastr.success(res.body?.message || 'Eğitimler başarıyla atandı.');
          this.activeModal.close('success');
        } else {
          this.toastr.error(res.header.msg || 'Atama sırasında bir hata oluştu.');
        }
        this.isSaving = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.header?.msg || 'Bir hata oluştu.');
        this.isSaving = false;
      }
    });
  }
}