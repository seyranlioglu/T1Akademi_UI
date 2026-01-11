import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CategoryService } from 'src/app/shared/services/category.service';
import { SidebarService } from 'src/app/shared/services/sidebar.service'; // YENİ: Servisi ekle
import { TrainingCategory } from 'src/app/shared/models/training-category.model';

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

  showCatMenu = false;
  showMyCourses = false;
  isProfileMenuOpen = false;
  
  // Eski isMobileMenuOpen değişkenini kaldırdık, artık SidebarService yönetiyor.

  categories: TrainingCategory[] = [];
  popularCategories: TrainingCategory[] = [];

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    private sidebarService: SidebarService // YENİ: Inject et
  ) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        this.isLoggedIn = true;
        const user = JSON.parse(userJson);
        this.userName = user.firstName ? `${user.firstName} ${user.lastName}` : 'Öğrenci';
        this.userEmail = user.email || '';
        this.userInitials = this.userName.match(/\b(\w)/g)?.join('').substring(0, 2).toUpperCase() || 'U';
        
        this.checkUserRole(user);
    }

    this.getCategoriesFromApi();
  }

  checkUserRole(user: any) {
    if (user.roles && Array.isArray(user.roles)) {
        this.isInstructor = user.roles.includes('Instructor') || user.roles.includes('Admin');
    } 
    else if (user.isInstructor === true) {
        this.isInstructor = true;
    }
  }

  getCategoriesFromApi() {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        const incomingData = response.body || response.body || response; 
        if (incomingData) {
            this.categories = incomingData;
            this.popularCategories = incomingData; 
        }
      },
      error: (err) => {
        console.error('Kategoriler yüklenirken hata oluştu:', err);
      }
    });
  }

  // YENİ: Mobilde menü butonuna basılınca çalışır
  toggleMobileMenu() {
    this.sidebarService.toggle(); // Sidebar'a "Açıl/Kapan" emri gönder
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