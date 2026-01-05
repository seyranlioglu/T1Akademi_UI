import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent {
  @Input() userMenuVisible = false;
  @Output() userMenuVisibleChange = new EventEmitter<any>();
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!(this.eRef.nativeElement.contains(event.target) || event.target.classList.contains('bx-user') || event.target.classList.contains('cart-btn'))) {
      this.userMenuVisible = false;
      this.userMenuVisibleChange.emit(this.userMenuVisible);
    }
  }
  
  user: any;

  constructor(private authService: AuthService, private eRef: ElementRef, private host: ElementRef<HTMLElement>) { }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
  }

  logout(): void {
    this.authService.logout();
    document.location.reload();
  }
}