import { Component, OnInit, HostListener } from '@angular/core';
import { SidebarService } from 'src/app/shared/services/sidebar.service';
import { MenuService } from 'src/app/shared/services/menu.service';
import { CategoryService } from 'src/app/shared/services/category.service'; // YENİ EKLENDİ
import { UserMenuDto } from 'src/app/shared/models/user-menu.model';
import { TrainingCategory } from 'src/app/shared/models/training-category.model'; // Modelin yeri burası varsayıldı

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  isCollapsed = false;
  isMobile = false;

  // --- SABİT MENÜLER ---
  staticMenuItems: UserMenuDto[] = [
    { title: 'Kontrol Paneli', path: '/dashboard', icon: 'bx bx-home-circle' },
    { title: 'Profilim', path: '/dashboard/my-profile', icon: 'bx bx-user' },
    { title: 'Eğitimlerim', path: '/dashboard/enrolled-courses', icon: 'bx bx-book-bookmark' },
    { title: 'İstek Listesi', path: '/dashboard/wishlist', icon: 'bx bx-heart' },
    { title: 'Siparişlerim', path: '/dashboard/orders-list', icon: 'bx bx-cart' },
    { title: 'Ayarlar', path: '/dashboard/edit-profile', icon: 'bx bx-cog' },
  ];

  // --- DİNAMİK ROLLER MENÜSÜ ---
  dynamicMenuItems: UserMenuDto[] = [];
  isInstructor = false;

  // --- KATEGORİLER (Sadece Mobil İçin) ---
  categories: TrainingCategory[] = [];
  activeMobileCategory: number | null = null; // Mobilde açılan kategori accordion'u için

  constructor(
    private sidebarService: SidebarService,
    private menuService: MenuService,
    private categoryService: CategoryService // Inject ettik
  ) { }

  ngOnInit(): void {
    this.checkScreenSize();
    
    this.sidebarService.isCollapsed$.subscribe(state => {
      this.isCollapsed = state;
    });

    this.getMenuFromApi();
    this.getCategories(); // Kategorileri çek
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 991;
  }

  // --- API İŞLEMLERİ ---
  getMenuFromApi() {
    this.menuService.getMyMenu().subscribe({
      next: (response: any) => {
        const data = response.data || response; 
        if (data) {
          this.isInstructor = data.isInstructor;
          this.dynamicMenuItems = data.menuItems || [];
        }
      }
    });
  }

  getCategories() {
    this.categoryService.getCategories().subscribe({
        next: (response: any) => {
            // Backend yapına göre response.body veya response.data olabilir, kontrol et
            this.categories = response.body || response.data || response;
        }
    });
  }

  // --- AKSİYONLAR ---
  toggleMobileCategory(catId: number) {
    if (this.activeMobileCategory === catId) {
      this.activeMobileCategory = null;
    } else {
      this.activeMobileCategory = catId;
    }
  }

  closeMobileMenu() {
    if (this.isMobile) {
      this.sidebarService.setCollapseState(true);
    }
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}