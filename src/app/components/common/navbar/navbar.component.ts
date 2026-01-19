import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SidebarService } from 'src/app/shared/services/sidebar.service';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  isLoggedIn = false;
  isInstructor = false;
  
  // Varsayılan değerler
  userName = 'Kullanıcı'; 
  userEmail = '';
  userInitials = 'U';
  userRole = 'Öğrenci'; // YENİ: Rol Gösterimi İçin

  showCatMenu = false;
  isProfileMenuOpen = false;

  searchTerm$ = new BehaviorSubject<string>(''); 
  searchResults: any[] = [];
  showSearchResults = false;
  isSearching = false;
  searchSubscription: Subscription | undefined;
  userSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService,
    private trainingService: TrainingApiService
  ) { }

  ngOnInit(): void {
    // LocalStorage yerine AuthService üzerinden dinliyoruz (En garantisi)
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
        if (user) {
            this.isLoggedIn = true;
            this.processUserData(user);
        } else {
            this.isLoggedIn = false;
            this.userName = 'Misafir';
            this.userInitials = 'M';
        }
    });

    this.initSearchListener();
  }

  // --- KULLANICI VERİSİNİ İŞLEME ---
  processUserData(user: any) {
      console.log('Navbar User Data:', user); // Debug için

      // 1. İSİM BELİRLEME (Loglara göre öncelik: name + surname)
      if (user.name && user.surname) {
          this.userName = `${user.name} ${user.surname}`;
      } 
      else if (user.firstName && user.lastName) {
          this.userName = `${user.firstName} ${user.lastName}`;
      }
      else if (user.fullName) {
          this.userName = user.fullName;
      }
      else if (user.email) {
          this.userName = user.email;
      }

      this.userEmail = user.email || '';

      // 2. BAŞ HARFLERİ HESAPLA
      this.calculateInitials();

      // 3. ROL VE YETKİ BELİRLEME
      this.determineUserRole(user);
  }

  calculateInitials() {
      if (this.userName && this.userName !== 'Kullanıcı' && this.userName !== 'Misafir') {
          const parts = this.userName.trim().split(' ');
          if (parts.length > 1) {
              const first = parts[0].charAt(0);
              const last = parts[parts.length - 1].charAt(0);
              this.userInitials = (first + last).toUpperCase();
          } else {
              this.userInitials = this.userName.substring(0, 2).toUpperCase();
          }
      } else if (this.userEmail) {
          this.userInitials = this.userEmail.charAt(0).toUpperCase();
      }
  }

  determineUserRole(user: any) {
      // Token'dan veya user objesinden rolü anlamaya çalışalım
      let roles: string[] = [];

      // User objesinde roles dizisi varsa
      if (user.roles && Array.isArray(user.roles)) {
          roles = user.roles.map((r: any) => r.toString().toLowerCase());
      }
      
      // Token varsa decode edip bakalım (Yedek kontrol)
      if (roles.length === 0 && user.accessToken) {
          try {
              const payload = JSON.parse(atob(user.accessToken.split('.')[1]));
              const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['role'];
              if (roleClaim) {
                  const rolesArray = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
                  roles = rolesArray.map((r: any) => r.toString().toLowerCase());
              }
          } catch (e) {
              console.error('Navbar token decode hatası:', e);
          }
      }

      // Rol Etiketini Belirle
      if (roles.includes('sa') || roles.includes('superadmin')) {
          this.userRole = 'Süper Yönetici';
          this.isInstructor = true; // Adminler de panel erişimine sahip olsun
      } else if (roles.includes('admin')) {
          this.userRole = 'Yönetici';
          this.isInstructor = true;
      } else if (roles.includes('instructor')) {
          this.userRole = 'Eğitmen';
          this.isInstructor = true;
      } else {
          this.userRole = 'Öğrenci';
          this.isInstructor = false;
      }
  }

  initSearchListener() {
    this.searchSubscription = this.searchTerm$.pipe(
      filter(term => term.length >= 3), 
      debounceTime(500), 
      distinctUntilChanged(), 
      switchMap(term => {
        this.isSearching = true;
        this.showSearchResults = true;
        return this.trainingService.searchTrainings(term);
      })
    ).subscribe({
      next: (res: any) => {
        this.isSearching = false;
        const data = res.data || res.result || res.body; 
        if (Array.isArray(data)) {
            this.searchResults = data;
        } else {
            this.searchResults = [];
        }
      },
      error: (err) => {
        this.isSearching = false;
        this.searchResults = [];
      }
    });
  }

  onSearchKeyUp(event: any) {
    const term = event.target.value;
    if (!term || term.trim().length === 0) {
        this.showSearchResults = false;
        this.searchResults = [];
        this.searchTerm$.next('');
        return;
    }
    if (event.key === 'Enter') {
        this.goToSearchPage(term);
        return;
    }
    this.searchTerm$.next(term);
  }

  goToSearchPage(term: string) {
    this.showSearchResults = false;
    this.router.navigate(['/courses'], { queryParams: { search: term } });
  }

  goToCourseDetail(courseId: number) {
      this.showSearchResults = false;
      this.router.navigate(['/course-details', courseId]);
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

  ngOnDestroy() {
      if (this.searchSubscription) this.searchSubscription.unsubscribe();
      if (this.userSubscription) this.userSubscription.unsubscribe();
  }
}