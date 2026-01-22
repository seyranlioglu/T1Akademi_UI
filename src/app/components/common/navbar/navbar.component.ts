import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CategoryService } from 'src/app/shared/services/category.service';
import { SidebarService } from 'src/app/shared/services/sidebar.service';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  isLoggedIn = false;
  isInstructor = false;
  
  userName = 'Kullanıcı';
  userEmail = '';
  userInitials = 'U';
  userRole = 'Öğrenci';

  showCatMenu = false;
  showMyCourses = false;
  isProfileMenuOpen = false;
  
  categories: any[] = [];
  
  // ÖĞRENİM İÇERİĞİM İÇİN ÖRNEK VERİ (Senin yapına uygun)
  recentCourses = [
    {
      title: 'SIFIRDAN YAZILIM TEMELLERİNİ ÖĞRENMEK',
      image: 'assets/images/courses/course1.jpg',
      progress: 25
    },
    {
      title: 'Unit Test Yazma - Asp.Net Core MVC/API',
      image: 'assets/images/courses/course2.jpg',
      progress: 10
    },
    {
      title: 'C# İle Algoritma Öğrenin!',
      image: 'assets/images/courses/course3.jpg',
      progress: 45
    }
  ];

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    private sidebarService: SidebarService,
    private trainingService: TrainingApiService
  ) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        this.isLoggedIn = true;
        try {
            const user = JSON.parse(userJson);
            this.processUserData(user);
        } catch (e) {
            console.error('User parse error', e);
        }
    }
    this.getCategoriesFromApi();
  }

  processUserData(user: any) {
      // 1. İSİM (Soyad varsa ekle)
      if (user.name && user.surname) {
          this.userName = `${user.name} ${user.surname}`;
      } else if (user.firstName && user.lastName) {
          this.userName = `${user.firstName} ${user.lastName}`;
      } else {
          this.userName = user.name || user.email || 'Kullanıcı';
      }
      
      this.userEmail = user.email || '';

      // 2. BAŞ HARFLER (Şükrü Şeyranlıoğlu -> ŞŞ)
      // Boşluklardan ayırıp ilk ve son parçanın baş harfini alıyoruz
      if (this.userName) {
          const parts = this.userName.trim().split(/\s+/); // Birden fazla boşluk varsa da çalışır
          if (parts.length >= 2) {
              // İlk ismin baş harfi + Son soyadın baş harfi
              this.userInitials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
          } else {
              // Tek kelimeyse ilk 2 harf (örn: Ahmet -> AH)
              this.userInitials = this.userName.substring(0, 2).toUpperCase();
          }
      }

      // 3. ROL BELİRLEME
      if (user.roles && Array.isArray(user.roles)) {
          const rolesLower = user.roles.map((r: any) => r.toString().toLowerCase());
          if (rolesLower.includes('admin') || rolesLower.includes('superadmin')) {
              this.userRole = 'Yönetici';
              this.isInstructor = true;
          } else if (rolesLower.includes('instructor')) {
              this.userRole = 'Eğitmen';
              this.isInstructor = true;
          } else {
              this.userRole = 'Öğrenci';
          }
      }
  }

  getCategoriesFromApi() {
    this.categoryService.getCategories().subscribe({
      next: (response: any) => {
        const data = response.data || response.body || response; 
        if (Array.isArray(data)) {
            this.categories = data;
        }
      },
      error: (err) => console.error(err)
    });
  }

  onSearchKeyUp(event: any) {
      if (event.key === 'Enter') {
          const term = event.target.value;
          if (term && term.length > 0) {
              this.router.navigate(['/courses'], { queryParams: { search: term } });
          }
      }
  }

  toggleMobileMenu() {
    this.sidebarService.toggle();
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/auth/login']).then(() => window.location.reload());
  }
}