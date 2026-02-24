import { Component, OnInit, Optional, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
// Servisin yolunu kendi projene göre ayarla:
import { CurrAccTrainingApiService, CompanyLibraryForAssignDto, CompanyUserAssignmentStatusDto  } from 'src/app/shared/api/curr-acc-training-api.service';

@Component({
  selector: 'app-assign-training',
  templateUrl: './assign-training.component.html',
  styleUrls: ['./assign-training.component.scss']
})
export class AssignTrainingComponent implements OnInit {
  
  // --- EKRAN DATALARI ---
  libraryTrainings: CompanyLibraryForAssignDto[] = [];
  companyUsers: CompanyUserAssignmentStatusDto[] = [];
  
  // --- FORM SEÇİMLERİ ---
  selectedTrainingId: number | null = null;
  selectedTrainingQuotaInfo: CompanyLibraryForAssignDto | null = null; 
  
  selectedUserIds: number[] = []; 
  startDate: Date = new Date();
  dueDate: Date | null = null;

  // --- HİBRİT MİMARİ KONTROLLERİ ---
  isModal: boolean = false;
  isLoading: boolean = false;

  constructor(
    private trainingApi: CurrAccTrainingApiService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    @Optional() public dialogRef: MatDialogRef<AssignTrainingComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isModal = !!this.dialogRef;
  }

  ngOnInit(): void {
    this.loadLibraryTrainings();

    // Ön Seçili Personel Mantığı (Pre-select)
    if (this.isModal && this.data && this.data.preSelectedUserId) {
      this.selectedUserIds.push(this.data.preSelectedUserId);
    } 
    else {
      const queryUserId = this.route.snapshot.queryParamMap.get('userId');
      if (queryUserId) {
        this.selectedUserIds.push(Number(queryUserId));
      }
    }
  }

  loadLibraryTrainings() {
    this.isLoading = true;
    this.trainingApi.getCompanyLibraryForAssign().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.libraryTrainings = res.data;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onTrainingSelect(currAccTrainingId: number) {
    this.selectedTrainingId = currAccTrainingId;
    
    // Kota bilgisini yakala
    this.selectedTrainingQuotaInfo = this.libraryTrainings.find(x => x.currAccTrainingId === currAccTrainingId) || null;

    if (this.selectedTrainingQuotaInfo) {
      this.loadCompanyUsers(this.selectedTrainingQuotaInfo.trainingId);
    }
  }

  loadCompanyUsers(trainingId: number) {
    this.isLoading = true;
    this.trainingApi.getCompanyUsersAssignmentStatus(trainingId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.companyUsers = res.data;
          
          // Zaten atanmış olan personelleri seçili (selectedUserIds) listesinden güvenlice çıkar
          const alreadyAssignedIds = this.companyUsers.filter(u => u.isAssigned).map(u => u.userId);
          this.selectedUserIds = this.selectedUserIds.filter(id => !alreadyAssignedIds.includes(id));
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  toggleUserSelection(userId: number, event: any) {
    if (event.target.checked) {
      if (!this.selectedUserIds.includes(userId)) {
        this.selectedUserIds.push(userId);
      }
    } else {
      this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
    }
  }

submitAssignment() {
    if (!this.selectedTrainingId) {
      this.toastr.warning('Lütfen bir eğitim seçiniz.');
      return;
    }
    if (this.selectedUserIds.length === 0) {
      this.toastr.warning('Lütfen en az bir personel seçiniz.');
      return;
    }

    const payload = {
      currAccTrainingId: this.selectedTrainingId,
      userIds: this.selectedUserIds,
      startDate: this.startDate,
      dueDate: this.dueDate ?? undefined 
    };

    this.isLoading = true;
    this.trainingApi.assignTraining(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.result) {
          this.toastr.success(res.message);
          this.closeComponent(true); 
        } else {
          this.toastr.error(res.message);
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Atama işlemi sırasında bir hata oluştu.');
      }
    });
  }

  closeComponent(isSuccess: boolean = false) {
    if (this.isModal) {
      this.dialogRef.close(isSuccess);
    } else {
      // Sayfadan açıldıysa geriye veya başka bir listeye yönlendir (Rotayı kendine göre düzenle)
      this.router.navigate(['/company/personnel-list']); 
    }
  }
}