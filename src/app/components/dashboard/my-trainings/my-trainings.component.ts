import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { ToastrService } from 'ngx-toastr';

// DTO arayüzümüz (Backend'deki GetMyTrainingDto'nun karşılığı)
export interface MyTrainingItem {
    id: number;
    title: string;
    description: string;
    subTitle: string;
    picturePath: string;
    categoryName: string;
    instructorName: string;
    totalContentCount: number;
    completedContentCount: number;
    progressPercentage: number;
    isCompleted: boolean;
    lastWatchedContentId: number | null;
    lastAccessDate: string | null;
    assignDate: string | null;
    dueDate: string | null;
    startDate: string | null;
    accessStatus: 'Active' | 'NotStarted' | 'Expired';
}

@Component({
  selector: 'app-my-trainings',
  templateUrl: './my-trainings.component.html',
  styleUrls: ['./my-trainings.component.scss']
})
export class MyTrainingsComponent implements OnInit, OnDestroy {

  private subs: Subscription = new Subscription();
  
  allTrainings: MyTrainingItem[] = [];
  displayedTrainings: MyTrainingItem[] = [];
  
  isLoading: boolean = true;
  searchTerm: string = '';
  selectedStatus: string = 'all'; // all, completed, active, expired

  constructor(
    private trainingApi: TrainingApiService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadMyTrainings();
  }

  loadMyTrainings() {
    this.isLoading = true;
    this.subs.add(
      this.trainingApi.getMyTrainings().subscribe({
        next: (res: any) => {
          // Backend'den gelen formata göre array'i çıkarıyoruz
          this.allTrainings = res.body || res.data || res || [];
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error('Eğitimleriniz yüklenirken bir hata oluştu.');
          this.isLoading = false;
        }
      })
    );
  }
// --- FİLTRELEME MANTIĞI ---
  applyFilters() {
    let temp = [...this.allTrainings];

    // 1. Durum Filtresi
    if (this.selectedStatus !== 'all') {
      if (this.selectedStatus === 'completed') {
        temp = temp.filter(t => t.isCompleted);
      } 
      else if (this.selectedStatus === 'active') {
        // 🔥 DEVAM EDENLER: Erişimi Aktif, Tamamlanmamış VE en az %1 ilerlemiş olanlar
        temp = temp.filter(t => t.accessStatus === 'Active' && !t.isCompleted && t.progressPercentage > 0);
      } 
      else if (this.selectedStatus === 'expired') {
        temp = temp.filter(t => t.accessStatus === 'Expired');
      } 
      else if (this.selectedStatus === 'notstarted') {
        // 🔥 BAŞLAMAYANLAR: Ya erişim tarihi gelmemiş (NotStarted) YA DA aktif ama %0 olanlar
        temp = temp.filter(t => t.accessStatus === 'NotStarted' || (t.accessStatus === 'Active' && t.progressPercentage === 0));
      }
    }

    // 2. Metin Filtresi
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      temp = temp.filter(t => 
        (t.title && t.title.toLowerCase().includes(term)) || 
        (t.categoryName && t.categoryName.toLowerCase().includes(term)) ||
        (t.instructorName && t.instructorName.toLowerCase().includes(term))
      );
    }

    this.displayedTrainings = temp;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onStatusChange(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  // --- AKSİYONLAR ---

  goToPlayer(training: MyTrainingItem) {
    if (training.accessStatus === 'Expired') {
        this.toastr.warning('Bu eğitimin erişim süresi dolmuştur.');
        return;
    }
    if (training.accessStatus === 'NotStarted') {
        this.toastr.info(`Bu eğitim henüz başlamadı. Başlama Tarihi: ${new Date(training.startDate!).toLocaleDateString()}`);
        return;
    }
    
    // Doğrudan player'a yönlendiriyoruz
    this.router.navigate(['/course-player', training.id]);
  }

  goToPreview(trainingId: number) {
    // Vitrin (detay) sayfasına yönlendir
    this.router.navigate(['/course', trainingId]);
  }

  downloadCertificate(training: MyTrainingItem) {
    if (!training.isCompleted) {
        this.toastr.warning('Sertifika alabilmek için eğitimi %100 tamamlamalısınız.');
        return;
    }
    // İleride buraya Sertifika indirme servisi bağlanacak
    this.toastr.success('Sertifikanız hazırlanıyor...', 'Başarılı');
    // Örnek: this.certificateApi.download(training.id).subscribe(...)
  }

  // --- UI YARDIMCILARI ---
  
getStatusBadgeClass(training: MyTrainingItem): string {
    if (training.isCompleted) return 'badge-completed'; // Yeşil
    if (training.accessStatus === 'Expired') return 'badge-expired'; // Kırmızı
    if (training.accessStatus === 'NotStarted') return 'badge-waiting'; // Sarı
    
    // 🔥 YENİ KONTROL: Erişim aktif ama henüz %0 izlemiş
    if (training.progressPercentage === 0) return 'badge-not-started'; // Gri
    
    return 'badge-active'; // Mavi/Açık Yeşil
  }

  getStatusText(training: MyTrainingItem): string {
    if (training.isCompleted) return 'TAMAMLANDI';
    if (training.accessStatus === 'Expired') return 'SÜRESİ DOLDU';
    if (training.accessStatus === 'NotStarted') return 'TARİHİ BEKLENİYOR';
    
    // 🔥 YENİ KONTROL: Henüz izlemeye başlamadıysa
    if (training.progressPercentage === 0) return 'BAŞLAMADI';
    
    return 'DEVAM EDİYOR';
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}