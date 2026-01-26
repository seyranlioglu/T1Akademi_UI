import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface CartItem {
  id: number;
  trainingId: number;
  trainingTitle: string;
  trainingImage: string;
  categoryName: string;
  amount: number;
  currentAmount: number;
  licenceCount: number;
}

export interface CartViewDto {
  cartId: number;
  totalAmount: number;
  totalItemCount: number;
  items: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/Cart`;

  // Başlangıç değeri boş obje (Hata önlemek için)
  private initialState: CartViewDto = {
    cartId: 0,
    totalAmount: 0,
    totalItemCount: 0,
    items: []
  };

  private cartSubject = new BehaviorSubject<CartViewDto>(this.initialState);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.loadCart(); 
  }

  loadCart() {
    this.http.get<any>(`${this.apiUrl}/get-active-cart`).subscribe({
      next: (res) => {
        // Backend'den gelen veriyi çözümle (Response Wrapper varsa .data, yoksa direkt kendisi)
        const data = res.data || res.body || res;
        
        if (!data) {
            this.cartSubject.next(this.initialState);
        } else {
            if (!data.items) data.items = [];
            this.cartSubject.next(data);
        }
      },
      error: () => {
        this.cartSubject.next(this.initialState);
      }
    });
  }

  // GÜNCELLENDİ: licenceCount parametresi eklendi
  addToCart(trainingId: number, licenceCount: number = 1): Observable<any> {
    const body = { trainingId, licenceCount };
    
    return this.http.post<any>(`${this.apiUrl}/add-to-cart`, body).pipe(
      tap((res) => {
        // İşlem başarılıysa backend güncel sepeti döner, onu yayına alıyoruz
        if (res.isSuccess) {
            const data = res.data || res.body || res;
            if (data) {
                if (!data.items) data.items = [];
                this.cartSubject.next(data);
            }
        }
      })
    );
  }

  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/remove-from-cart/${cartItemId}`).pipe(
      tap((res) => {
        if (res.isSuccess) {
            const data = res.data || res.body || res;
            if (data) {
                if (!data.items) data.items = [];
                this.cartSubject.next(data);
            }
        }
      })
    );
  }
}