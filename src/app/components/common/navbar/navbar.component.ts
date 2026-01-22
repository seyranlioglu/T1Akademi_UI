import { Component, OnInit, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CategoryService } from 'src/app/shared/services/category.service';
import { SidebarService } from 'src/app/shared/services/sidebar.service';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  // --- KULLANICI DEĞİŞKENLERİ ---
  isLoggedIn = false;
  isInstructor = false;
  
  userName = 'Kullanıcı';
  userEmail = '';
  userInitials = 'U';
  userRole = 'Öğrenci';

  // --- MENÜ KONTROLLERİ ---
  showCatMenu = false;
  showMyCourses = false;
  isProfileMenuOpen = false;
  
  // --- DATA LİSTELERİ ---
  categories: any[] = [];
  recentCourses: any[] = []; // Öğrenim içeriğim (API'den dolar)

  // --- ARAMA (AUTOCOMPLETE) DEĞİŞKENLERİ ---
  searchResults: any[] = [];
  showSearchResults = false;
  private searchSubject = new Subject<string>();

  // HTML tarafındaki arama kutusunu (container) seçiyoruz
  // Dışarı tıklamayı algılamak için gerekli
  @ViewChild('searchBoxContainer') searchBoxContainer!: ElementRef;

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    private sidebarService: SidebarService,
    private trainingService: TrainingApiService
  ) { }

  ngOnInit(): void {
    // 1. KULLANICI KONTROLÜ VE VERİSİ
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        this.isLoggedIn = true;
        try {
            const user = JSON.parse(userJson);
            this.processUserData(user);
            this.loadMyCourses(); 
        } catch (e) {
            console.error('User parse error', e);
        }
    }

    // 2. KATEGORİLERİ ÇEK
    this.getCategoriesFromApi();

    // 3. ARAMA DİNLEYİCİSİ (AUTOCOMPLETE MANTIĞI)
    this.searchSubject.pipe(
      debounceTime(300),        // Kullanıcı yazmayı bıraktıktan 300ms sonra çalış
      distinctUntilChanged(),   // Aynı kelime tekrar gelirse çalışma
      switchMap(term => {
        if (term.length >= 2) {
           // 3 harf ve üzeriyse API'ye git
           return this.trainingService.searchTrainings(term).pipe(
             catchError(error => {
               console.error('Arama hatası:', error);
               return of([]); // Hata olursa boş dizi dön
             })
           );
        } else {
          return of([]); // 3 harften azsa boş dön
        }
      })
    ).subscribe((results: any) => {
        // Backend'den gelen veri yapısını kontrol et
        const data = results.data || results.body || results;
        if(Array.isArray(data)){
            this.searchResults = data;
            this.showSearchResults = data.length > 0;
        } else {
             this.searchResults = [];
             this.showSearchResults = false;
        }
    });
  }

  // --- DIŞARI TIKLAMA (CLICK OUTSIDE) DİNLEYİCİSİ ---
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Eğer arama sonuçları açıksa VE tıklanan yer arama kutusunun içinde değilse kapat
    if (this.showSearchResults && this.searchBoxContainer && !this.searchBoxContainer.nativeElement.contains(event.target)) {
      this.showSearchResults = false;
    }
  }

  // --- API: KULLANICI KURSLARI (Öğrenim İçeriğim Menüsü) ---
  loadMyCourses() {
    this.trainingService.getNavbarRecentTrainings(5).subscribe({
        next: (data: any[]) => {
            if (Array.isArray(data)) {
                this.recentCourses = data;
            }
        },
        error: (err) => {
            console.error('Navbar kursları yüklenemedi', err);
        }
    });
  }

  // --- KULLANICI VERİSİNİ İŞLEME ---
  processUserData(user: any) {
      // 1. İSİM SOYİSİM (Logdaki veri yapısına göre)
      if (user.name && user.surName) {
          this.userName = `${user.name} ${user.surName}`;
      } else {
          this.userName = user.name || 'Kullanıcı';
      }

      // 2. BAŞ HARFLER (Backend'den gelen hazır alan)
      this.userInitials = user.userShortName || 'U';

      // 3. E-POSTA
      this.userEmail = user.email || '';

      // 4. ROL BELİRLEME
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

  // --- KATEGORİLERİ ÇEKME ---
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

  // --- ARAMA METODLARI ---

  // Input'a her basıldığında çalışır (HTML'den çağrılır -> Subject'i tetikler)
  onSearchChange(term: string) {
    this.searchSubject.next(term);
    // 3 harften azsa listeyi temizle ve kapat
    if(term.length < 3) {
        this.showSearchResults = false;
        this.searchResults = [];
    }
  }

  // Enter'a basınca veya büyütece tıklayınca çalışır (Arama sayfasına gider)
  search(term: string) {
      this.showSearchResults = false; // Dropdown'ı kapat
      if (term && term.trim().length > 0) {
          this.router.navigate(['/courses'], { queryParams: { search: term.trim() } });
      }
  }

  // Listeden bir sonuca tıklayınca arama geçmişini temizle
  clearSearch(inputElement: HTMLInputElement){
      inputElement.value = '';
      this.showSearchResults = false;
      this.searchResults = [];
  }

  // --- DİĞER MENÜ İŞLEMLERİ ---
  
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