import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CategoryService } from 'src/app/shared/services/category.service';
// DİKKAT: SidebarService importu burada kesinlikle olmalı
import { SidebarService } from 'src/app/shared/services/sidebar.service';

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
  
  categories: any[] = []; 
  popularCategories: any[] = [];

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    // Servisi buraya private olarak enjekte ediyoruz
    private sidebarService: SidebarService
  ) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        this.isLoggedIn = true;
        try {
            const user = JSON.parse(userJson);
            this.userName = user.firstName ? `${user.firstName} ${user.lastName}` : 'Öğrenci';
            this.userEmail = user.email || '';
            this.userInitials = this.userName.match(/\b(\w)/g)?.join('').substring(0, 2).toUpperCase() || 'U';
            this.checkUserRole(user);
        } catch (e) {
            console.error('User parse error', e);
        }
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
      next: (response: any) => {
        const incomingData = response.body || response.data || response; 
        if (Array.isArray(incomingData)) {
            this.categories = incomingData;
            this.popularCategories = incomingData.slice(0, 8); 
        }
      },
      error: (err) => {
        console.error('Kategoriler yüklenirken hata oluştu:', err);
      }
    });
  }

  // Mobil menü butonu tıklandığında çalışacak fonksiyon
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