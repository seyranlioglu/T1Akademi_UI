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

// 🔥 YENİ: Backend'deki Enum'ın birebir TypeScript karşılığı
export enum CartActionType {
  Checkout = 0,             // Bireysel Kullanıcı -> "Siparişi Tamamla"
  B2BPurchaseRequest = 1,   // Kurum Yöneticisi -> "Satın Alma Talebi Oluştur"
  RequestFromManager = 2    // Standart Personel -> "Yöneticiden Talep Et"
}

export interface CartViewDto {
  cartId: number;
  totalAmount: number;
  totalItemCount: number;
  primaryAction: CartActionType; // 🔥 YENİ: Backend'in emrettiği buton tipi
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
    primaryAction: CartActionType.Checkout, // Varsayılan değer
    items: []
  };

  // BehaviorSubject
  private cartSubject = new BehaviorSubject<CartViewDto>(this.initialState);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.loadCart(); 
  }

  loadCart() {
    this.http.get<any>(`${this.apiUrl}/get-active-cart`).subscribe({
      next: (res) => {
        if (res.header && res.header.result && res.body) {
            this.updateCartState(res.body);
        } else if (res.data) {
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

  addToCart(trainingId: number, licenceCount: number = 1): Observable<any> {
    const body = { trainingId, licenceCount };
    return this.http.post<any>(`${this.apiUrl}/add-to-cart`, body).pipe(
      tap((res) => {
        if (res.header && res.header.result) {
            if (res.body) {
                this.updateCartState(res.body);
            } else {
                this.loadCart();
            }
        }
      })
    );
  }

  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/remove-from-cart/${cartItemId}`).pipe(
      tap((res) => {
        if (res.header && res.header.result) {
            if (res.body) {
                this.updateCartState(res.body);
            } else {
                this.loadCart();
            }
        }
      })
    );
  }

  // 🔥 GÜNCELLENDİ: Hem Checkout hem de Talep (B2B) için aynı veya farklı endpoint kullanılabilir. 
  // Şimdilik senin yazdığın PurchaseRequest metodunu kullanıyoruz.
  createPurchaseRequest(requestNote?: string): Observable<any> {
    let url = `${this.apiUrl}/create-purchase-request`;
    if (requestNote) {
        url += `?requestNote=${encodeURIComponent(requestNote)}`;
    }
    
    return this.http.post<any>(url, {}).pipe(
      tap((res) => {
        if (res.header && res.header.result) {
            this.cartSubject.next(this.initialState);
        }
      })
    );
  }

  private updateCartState(data: any) {
      if (!data) {
          this.cartSubject.next(this.initialState);
          return;
      }
      if (!data.items) {
          data.items = [];
      }
      this.cartSubject.next(data);
  }
}