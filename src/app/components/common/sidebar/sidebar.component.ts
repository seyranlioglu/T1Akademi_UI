import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from 'src/app/shared/services/sidebar.service';
import { CategoryService } from 'src/app/shared/services/category.service';
import { MenuApiService } from 'src/app/shared/api/menu-api.service';
import { MenuItemDto } from 'src/app/shared/models/user-menu.model';
// Çıkış işlemi için AuthService eklendi
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  
  isCollapsed: boolean = true;
  userMenuItems: MenuItemDto[] = [];
  categories: any[] = [];

  constructor(
    public router: Router,
    private sidebarService: SidebarService,
    private categoryService: CategoryService,
    private menuService: MenuApiService,
    private authService: AuthService // Eklendi
  ) {}

  ngOnInit() {
    this.sidebarService.isCollapsed$.subscribe(status => {
      this.isCollapsed = status;
    });

    this.fetchUserMenu();
    this.fetchCategories();
  }

  fetchUserMenu() {
    this.menuService.getMyMenu().subscribe({
      next: (menuData) => {
        this.userMenuItems = menuData;
        console.log("Menü Başarıyla Yüklendi:", this.userMenuItems);
      },
      error: (err) => {
        console.error("Menü yüklenirken hata oluştu:", err);
      }
    });
  }

  fetchCategories() {
    this.categoryService.getCategories().subscribe((res: any) => {
      const data = res.data || res.body || res;
      if (Array.isArray(data)) {
        this.categories = data;
      }
    });
  }

  toggleItem(item: any) {
    item.expanded = !item.expanded;
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  // Navbar'daki çıkış fonksiyonunun aynısı buraya eklendi
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']).then(() => window.location.reload());
  }
}