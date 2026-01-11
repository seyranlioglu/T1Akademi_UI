import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // Başlangıç durumu: false (Yani AÇIK/GENİŞ)
  private collapseSubject = new BehaviorSubject<boolean>(false);
  
  // Componentlerin dinleyeceği değişken
  isCollapsed$ = this.collapseSubject.asObservable();

  // Aç/Kapa işlemi
  toggle() {
    this.collapseSubject.next(!this.collapseSubject.value);
  }

  // Durumu direkt set etme (örn: Mobildeyken direkt kapat demek için)
  setCollapseState(isCollapsed: boolean) {
    this.collapseSubject.next(isCollapsed);
  }
}