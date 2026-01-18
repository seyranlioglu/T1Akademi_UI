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
  
  // Varsayılan değer
  userName = 'Kullanıcı'; 
  userEmail = '';
  userInitials = 'U';

  showCatMenu = false;
  isProfileMenuOpen = false;

  searchTerm$ = new BehaviorSubject<string>(''); 
  searchResults: any[] = [];
  showSearchResults = false;
  isSearching = false;
  searchSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService,
    private trainingService: TrainingApiService
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.initSearchListener();
  }

  // --- KULLANICI VERİSİNİ OKUMA (GÜÇLENDİRİLMİŞ) ---
  loadUserData() {
    // 1. Önce olası anahtarları kontrol et
    let userJson = localStorage.getItem('currentUser');
    if (!userJson) userJson = localStorage.getItem('user');
    if (!userJson) userJson = localStorage.getItem('User'); // Bazen büyük harf olabilir

    if (userJson) {
      this.isLoggedIn = true;
      try {
        const parsedData = JSON.parse(userJson);

        // 2. Veri yapısını çöz (Bazen user objesi 'data' veya 'user' propertysi içinde olabilir)
        // Eğer direkt obje ise 'parsedData', içinde user varsa 'parsedData.user'
        const user = parsedData.user || parsedData.data || parsedData;

        // 3. İsim alanlarını kontrol et
        if (user.firstName && user.lastName) {
            this.userName = `${user.firstName} ${user.lastName}`;
        } 
        else if (user.name && user.surName) { // Bazen backend 'surName' döner
            this.userName = `${user.name} ${user.surName}`;
        }
        else if (user.name && user.surname) { 
            this.userName = `${user.name} ${user.surname}`;
        }
        else if (user.fullName) {
            this.userName = user.fullName;
        }
        else if (user.userName) {
            this.userName = user.userName;
        }
        else if (user.email) {
            this.userName = user.email; // Hiçbir şey yoksa email göster
        }

        this.userEmail = user.email || '';

        // 4. Baş harfleri hesapla
        this.calculateInitials();

        // 5. Rol Kontrolü
        this.checkUserRole(user);

      } catch (e) {
        console.error('Kullanıcı verisi okunamadı:', e);
      }
    }
  }

  calculateInitials() {
      if (this.userName && this.userName !== 'Kullanıcı') {
          const parts = this.userName.trim().split(' ');
          if (parts.length > 1) {
              // Ad ve Soyadın ilk harfleri
              const first = parts[0].charAt(0);
              const last = parts[parts.length - 1].charAt(0);
              this.userInitials = (first + last).toUpperCase();
          } else {
              // Sadece tek isim varsa ilk 2 harf
              this.userInitials = this.userName.substring(0, 2).toUpperCase();
          }
      } else if (this.userEmail) {
          this.userInitials = this.userEmail.charAt(0).toUpperCase();
      } else {
          this.userInitials = 'U';
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
        console.error('Arama hatası:', err);
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

  checkUserRole(user: any) {
    // Rol kontrolü: roles array mi, yoksa string mi, yoksa boolean mı?
    if (user.roles && Array.isArray(user.roles)) {
        this.isInstructor = user.roles.includes('Instructor') || user.roles.includes('Admin');
    } else if (user.isInstructor === true) {
        this.isInstructor = true;
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

  ngOnDestroy() {
      if (this.searchSubscription) {
          this.searchSubscription.unsubscribe();
      }
  }
}