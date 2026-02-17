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
  amount: number;       // Birim Fiyat
  currentAmount: number; // Satır Toplamı (Backend'den bu isimle geliyor)
  licenceCount: number;
  discountRate: number;
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

  // Başlangıç değeri
  private initialState: CartViewDto = {
    cartId: 0,
    totalAmount: 0,
    totalItemCount: 0,
    items: []
  };

  // BehaviorSubject
  private cartSubject = new BehaviorSubject<CartViewDto>(this.initialState);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.loadCart(); 
  }

  // Sepeti yükle
  loadCart() {
    this.http.get<any>(`${this.apiUrl}/get-active-cart`).subscribe({
      next: (res) => {
        // Response yapısını kontrol et
        if (res.header && res.header.result && res.body) {
            this.updateCartState(res.body);
        } else if (res.data) {
            // Eğer wrapper farklıysa (eski yapı)
            this.updateCartState(res.data);
        } else {
            this.cartSubject.next(this.initialState);
        }
      },
      error: () => {
        this.cartSubject.next(this.initialState);
      }
    });
  }

  // Sepete Ekle
  addToCart(trainingId: number, licenceCount: number = 1): Observable<any> {
    const body = { trainingId, licenceCount };
    
    return this.http.post<any>(`${this.apiUrl}/add-to-cart`, body).pipe(
      tap((res) => {
        // 🔥 KRİTİK DÜZELTME: Header içindeki result'a bakıyoruz
        if (res.header && res.header.result) {
            // Backend güncel sepeti body içinde dönüyor, bunu direkt basıyoruz.
            // Böylece tekrar loadCart yapmaya gerek kalmadan anında güncellenir.
            if (res.body) {
                this.updateCartState(res.body);
            } else {
                // Body boşsa garanti olsun diye loadCart çağır
                this.loadCart();
            }
        }
      })
    );
  }

  // Sepetten Sil
  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/remove-from-cart/${cartItemId}`).pipe(
      tap((res) => {
        if (res.header && res.header.result) {
            // Silme işleminden sonra backend güncel sepeti dönüyorsa kullan
            if (res.body) {
                this.updateCartState(res.body);
            } else {
                // Dönmüyorsa manuel çek
                this.loadCart();
            }
        }
      })
    );
  }

  // Helper: State Güncelleme ve Null Kontrolü
  private updateCartState(data: any) {
      if (!data) {
          this.cartSubject.next(this.initialState);
          return;
      }
      // Items null gelebilir, boş array yapalım
      if (!data.items) {
          data.items = [];
      }
      this.cartSubject.next(data);
  }
}