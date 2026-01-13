import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // true: Kapalı, false: Açık. Default AÇIK olması için false yaptık.
  private collapseSubject = new BehaviorSubject<boolean>(false); 
  isCollapsed$ = this.collapseSubject.asObservable();

  constructor() { }

  toggle() {
    this.collapseSubject.next(!this.collapseSubject.value);
  }

  setCollapsed(isCollapsed: boolean) {
    this.collapseSubject.next(isCollapsed);
  }
}