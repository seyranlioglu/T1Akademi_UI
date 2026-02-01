import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/models/user-menu.model'; // Veya uygun user modeli

@Component({
  selector: 'app-instructor',
  templateUrl: './instructor.component.html',
  styleUrls: ['./instructor.component.scss']
})
export class InstructorComponent implements OnInit {

  isSidebarCollapsed = false;
  user$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user$ = this.authService.currentUser$; // User bilgisini al
  }

  ngOnInit(): void {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    // AuthService'de logout metodu varsa onu çağır
    this.authService.logout(); 
    // Veya manuel silme:
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    this.router.navigate(['/']);
  }
}