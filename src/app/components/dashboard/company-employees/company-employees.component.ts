import { Component, OnInit } from '@angular/core';
import { UserApiService } from 'src/app/shared/api/user-api.service';
// Model yolunu projendeki gerçek yola göre düzelttim varsayıyorum
// import { ManagedUser } from 'src/app/shared/models/managed-user.model'; 

// Eğer model dosyası yoksa interface'i buraya koyabilirsin veya shared altına taşıyabilirsin:
export interface ManagedUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
    title: string | null;
    companyName: string | null;
    isActive: boolean;
    status: string;
    createdDate: string;
    viewMode: 'AdminView' | 'CompanyView' | 'InstructorView';
}

@Component({
  selector: 'app-company-employees',
  templateUrl: './company-employees.component.html',
  styleUrls: ['./company-employees.component.scss']
})
export class CompanyEmployeesComponent implements OnInit {

  users: ManagedUser[] = [];
  isLoading = true;
  errorMessage = '';
  searchText = '';

  constructor(private userApiService: UserApiService) { }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    this.userApiService.getManagedUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
        console.log('Gelen Personel Listesi:', data);
      },
      error: (err) => {
        console.error('Personel listesi hatası:', err);
        this.errorMessage = 'Personel listesi yüklenemedi.';
        this.isLoading = false;
        // Hata olsa bile users boş kalsın ki tablo patlamasın
        this.users = []; 
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'aktif': return 'bg-success'; 
      case 'pasif': return 'bg-danger';  
      case 'öğrenci': return 'bg-info';  
      default: return 'bg-secondary';
    }
  }
}