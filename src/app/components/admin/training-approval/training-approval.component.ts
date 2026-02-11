import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';

@Component({
  selector: 'app-training-approval',
  templateUrl: './training-approval.component.html',
  styleUrls: ['./training-approval.component.scss']
})
export class TrainingApprovalComponent implements OnInit {

  activeTab: string = 'trainings'; // Varsayılan sekme
  isLoading: boolean = false;
  pendingTrainings: any[] = [];

  constructor(
    private trainingApi: TrainingApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  // Sekme değiştirme (İleride yorumlar vs. eklenirse)
  changeTab(tabName: string) {
    this.activeTab = tabName;
    this.loadData();
  }

  loadData() {
    if (this.activeTab === 'trainings') {
      this.fetchPendingTrainings();
    }
  }

  fetchPendingTrainings() {
    this.isLoading = true;
    this.trainingApi.getPendingTrainings().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.header.result) {
          this.pendingTrainings = res.body;
        } else {
          this.pendingTrainings = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Veriler yüklenirken hata oluştu.');
      }
    });
  }
}