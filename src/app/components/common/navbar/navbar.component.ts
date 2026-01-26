import { Component, OnInit, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CategoryService } from 'src/app/shared/services/category.service';
import { SidebarService } from 'src/app/shared/services/sidebar.service';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CartService, CartViewDto } from 'src/app/shared/services/cart.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  // KULLANICI
  isLoggedIn = false;
  isInstructor = false;
  userName = 'Kullanıcı';
  userEmail = '';
  userInitials = 'U';
  userRole = 'Öğrenci';

  // MENÜ
  showCatMenu = false;
  showMyCourses = false;
  isProfileMenuOpen = false;
  
  // DATA
  categories: any[] = [];
  recentCourses: any[] = [];

  // ARAMA
  searchResults: any[] = [];
  showSearchResults = false;
  private searchSubject = new Subject<string>();

  // SEPET (Başlangıçta boş obje atıyoruz hatayı önlemek için)
  cartData: CartViewDto = { cartId: 0, totalAmount: 0, totalItemCount: 0, items: [] };
  showCartDropdown = false;

  @ViewChild('searchBoxContainer') searchBoxContainer!: ElementRef;

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    private sidebarService: SidebarService,
    private trainingService: TrainingApiService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    // 1. KULLANICI
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        this.isLoggedIn = true;
        try {
            const user = JSON.parse(userJson);
            this.processUserData(user);
            this.loadMyCourses(); 
            this.cartService.loadCart();
        } catch (e) {
            console.error('User parse error', e);
        }
    }

    // 2. KATEGORİLER
    this.getCategoriesFromApi();

    // 3. ARAMA
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length >= 2) {
           return this.trainingService.searchTrainings(term).pipe(
             catchError(error => {
               console.error('Arama hatası:', error);
               return of([]);
             })
           );
        } else {
          return of([]);
        }
      })
    ).subscribe((results: any) => {
        const data = results.data || results.body || results;
        if(Array.isArray(data)){
            this.searchResults = data;
            this.showSearchResults = data.length > 0;
        } else {
             this.searchResults = [];
             this.showSearchResults = false;
        }
    });

    // 4. SEPET DİNLEME (Null gelse bile hata vermez)
    this.cartService.cart$.subscribe(data => {
      if (data) {
        this.cartData = data;
      }
    });
  }

  removeItemFromCart(itemId: number, event: Event) {
    event.stopPropagation();
    this.cartService.removeFromCart(itemId).subscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showSearchResults && this.searchBoxContainer && !this.searchBoxContainer.nativeElement.contains(event.target)) {
      this.showSearchResults = false;
    }
  }

  loadMyCourses() {
    this.trainingService.getNavbarRecentTrainings(5).subscribe({
        next: (data: any[]) => {
            if (Array.isArray(data)) {
                this.recentCourses = data;
            }
        },
        error: (err) => console.error(err)
    });
  }

  processUserData(user: any) {
      if (user.name && user.surName) {
          this.userName = `${user.name} ${user.surName}`;
      } else {
          this.userName = user.name || 'Kullanıcı';
      }
      this.userInitials = user.userShortName || 'U';
      this.userEmail = user.email || '';

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

  onSearchChange(term: string) {
    this.searchSubject.next(term);
    if(term.length < 3) {
        this.showSearchResults = false;
        this.searchResults = [];
    }
  }

  search(term: string) {
      this.showSearchResults = false;
      if (term && term.trim().length > 0) {
          this.router.navigate(['/courses'], { queryParams: { search: term.trim() } });
      }
  }

  clearSearch(inputElement: HTMLInputElement){
      inputElement.value = '';
      this.showSearchResults = false;
      this.searchResults = [];
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