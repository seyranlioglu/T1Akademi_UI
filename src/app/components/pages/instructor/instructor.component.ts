import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/models/user-menu.model';
import { NotificationService, AppNotification } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-instructor',
  templateUrl: './instructor.component.html',
  styleUrls: ['./instructor.component.scss']
})
export class InstructorComponent implements OnInit {

  isSidebarCollapsed = false; // Desktop için daraltma
  isMobileMenuOpen = false;   // Mobil için açma/kapama
  user$: Observable<User | null>;

  // --- BİLDİRİM DEĞİŞKENLERİ ---
  showNotificationDropdown = false;
  activeNotifTab: 'notifications' | 'messages' = 'notifications';
  notifications: AppNotification[] = [];
  unreadNotifCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.user$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.checkScreenSize();

    // Bildirimleri Yükle ve Dinle
    this.notificationService.loadNotifications();
    this.notificationService.notifications$.subscribe(res => {
        this.notifications = res.filter(n => !n.isRead)
            .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    });
    this.notificationService.unreadCount$.subscribe(count => this.unreadNotifCount = count);
  }

  // Ekran boyutuna göre sidebar durumunu ayarla
  @HostListener('window:resize', [])
  checkScreenSize() {
    if (window.innerWidth <= 992) {
      this.isSidebarCollapsed = false; // Mobilde collapsed mantığı yok, direk gizli/açık var
    }
  }

  toggleSidebar() {
    if (window.innerWidth <= 992) {
      // Mobilde menüyü aç/kapat
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    } else {
      // Desktopta daralt/genişlet
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.authService.logout(); 
    this.router.navigate(['/auth/login']);
  }

  // --- BİLDİRİM METODLARI ---
  switchNotifTab(tab: 'notifications' | 'messages', event: Event) {
      event.stopPropagation();
      this.activeNotifTab = tab;
  }

  onNotificationClick(notif: AppNotification) {
      if (!notif.isRead) {
          this.notificationService.markAsRead(notif.id);
      }
      this.showNotificationDropdown = false;
      if (notif.link) {
          this.router.navigateByUrl(notif.link);
      }
  }
}