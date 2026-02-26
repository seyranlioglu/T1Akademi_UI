import { Component, OnInit, Optional, Inject, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { 
  CurrAccTrainingApiService, 
  CompanyLibraryForAssignDto, 
  CompanyUserAssignmentStatusDto 
} from 'src/app/shared/api/curr-acc-training-api.service';

@Component({
  selector: 'app-assign-training',
  templateUrl: './assign-training.component.html',
  styleUrls: ['./assign-training.component.scss']
})
export class AssignTrainingComponent implements OnInit {
  
  // --- PARAMETRİK AYARLAR ---
  // Başarıdan sonra ekran kapansın mı? 
  // Modal açılırken data içinde 'keepOpen' gönderilirse ona göre davranır.
  @Input() keepOpenAfterSuccess: boolean = true; 

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
    
    // Eğer Modal içinden bir tercih gelmişse onu uygula, yoksa varsayılan true.
    if (this.isModal && this.data?.keepOpenAfterSuccess !== undefined) {
      this.keepOpenAfterSuccess = this.data.keepOpenAfterSuccess;
    }
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
        if (res.header && res.header.result) {
          this.libraryTrainings = res.body || [];
        } else {
          this.toastr.error(res.header?.msg || 'Eğitimler yüklenemedi');
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Sunucu bağlantı hatası');
        this.isLoading = false;
      }
    });
  }

  onTrainingSelect(currAccTrainingId: number) {
    this.selectedTrainingId = currAccTrainingId;
    const training = this.libraryTrainings.find(x => x.currAccTrainingId === currAccTrainingId);
    
    if (training) {
      this.selectedTrainingQuotaInfo = training;
      this.loadCompanyUsers(training.trainingId); 
    }
  }

  loadCompanyUsers(trainingId: number) {
    this.isLoading = true;
    this.trainingApi.getCompanyUsersAssignmentStatus(trainingId).subscribe({
      next: (res) => {
        if (res.header && res.header.result) {
          this.companyUsers = res.body || [];
          
          // Zaten atanmış olanları seçili listesinden temizle
          const alreadyAssignedIds = this.companyUsers
            .filter(u => u.isAssigned)
            .map(u => u.userId);
            
          this.selectedUserIds = this.selectedUserIds.filter(id => !alreadyAssignedIds.includes(id));
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
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

  toggleAllUsers(event: any) {
    if (event.target.checked) {
      const availableUserIds = this.companyUsers
        .filter(u => !u.isAssigned)
        .map(u => u.userId);
      this.selectedUserIds = [...availableUserIds];
    } else {
      this.selectedUserIds = [];
    }
  }

  isAllSelected(): boolean {
    if (!this.companyUsers.length) return false;
    const availableUsers = this.companyUsers.filter(u => !u.isAssigned);
    if (!availableUsers.length) return false;
    return availableUsers.every(u => this.selectedUserIds.includes(u.userId));
  }

  submitAssignment() {
    if (!this.selectedTrainingId || this.selectedUserIds.length === 0) {
      this.toastr.warning('Lütfen seçimlerinizi kontrol ediniz.');
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
        
        if (res.header && res.header.result) {
          this.toastr.success(res.header.msg || 'Atama başarıyla tamamlandı.');
          
          // --- BURASI KRİTİK ---
          if (this.keepOpenAfterSuccess) {
            // Ekranı kapatma, sadece mevcut seçimleri sıfırla ve listeyi tazele
            this.selectedUserIds = [];
            // Seçili eğitimi tekrar tetikle ki personellerin yanındaki "Atandı" yazısı güncellensin
            this.onTrainingSelect(this.selectedTrainingId!);
            // Kotayı da kütüphaneden tazeleyelim (Kalan lisans sayısı düşsün)
            this.loadLibraryTrainings();
          } else {
            // Parametrik olarak istenmişse veya sayfadaysa kapat/yönlendir
            this.closeComponent(true);
          }

        } else {
          this.toastr.error(res.header?.msg || 'Bir hata oluştu.');
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Sunucuyla iletişim kurulurken bir hata oluştu.');
      }
    });
  }

  closeComponent(isSuccess: boolean = false) {
    if (this.isModal) {
      this.dialogRef.close(isSuccess);
    } else {
      // Eğer sayfadan yönlendirileceksek (Personel Listesine Dön)
      this.router.navigate(['/company/personnel-list']); 
    }
  }
}