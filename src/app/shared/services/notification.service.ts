import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  link?: string;
  type: string;
  isRead: boolean;
  createdDate: Date;
  timeAgo: string;
  iconClass: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/Notifications`;
  
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  loadNotifications() {
    this.http.get<any>(`${this.apiUrl}/get-my-notifications`).subscribe({
      next: (res) => {
        const data = res.data || res.body || res;
        if (Array.isArray(data)) {
          this.notificationsSubject.next(data);
          this.updateUnreadCount(data);
        }
      },
      error: (err) => console.error('Bildirimler yüklenemedi', err)
    });
  }

  markAsRead(id: number) {
    // Optimistik güncelleme (UI hemen güncellensin)
    const current = this.notificationsSubject.value;
    const updated = current.map(n => n.id === id ? { ...n, isRead: true } : n);
    this.notificationsSubject.next(updated);
    this.updateUnreadCount(updated);

    // Backend isteği
    return this.http.post(`${this.apiUrl}/mark-as-read/${id}`, {}).subscribe();
  }

  private updateUnreadCount(list: AppNotification[]) {
    const count = list.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(count);
  }
}