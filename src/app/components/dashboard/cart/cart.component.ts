import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartViewDto, CartActionType } from 'src/app/shared/services/cart.service';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  // 🔥 HTML dosyasından enum değerlerine erişebilmek için:
  public ActionTypes = CartActionType;

  cartData: CartViewDto = { cartId: 0, totalAmount: 0, totalItemCount: 0, primaryAction: CartActionType.Checkout, items: [] };
  isLoading = true;
  couponCode = '';
  
  requestNote = '';
  isProcessing = false;

  recommendedTrainings: any[] = [];
  
  carouselOptions: OwlOptions = { /* ... Aynı kalıyor ... */ };

  constructor(
    private cartService: CartService,
    private trainingApi: TrainingApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cartService.cart$.subscribe(data => {
      if (data) {
        this.cartData = data;
        this.isLoading = false;
      }
    });

    this.loadRecommended();
  }

  loadRecommended() {
      this.trainingApi.getRecommendedTrainings().subscribe(res => {
          this.recommendedTrainings = res || [];
      });
  }

  removeItem(itemId: number) {
    if (confirm('Bu eğitimi sepetten çıkarmak istediğinize emin misiniz?')) {
      this.cartService.removeFromCart(itemId).subscribe();
    }
  }

  // Ana İşlem Metodu: Backend'den gelen ActionTipine göre istek atılacak endpoint değişebilir.
  processCartAction() {
    if (this.cartData.items.length === 0) return;

    this.isProcessing = true;
    
    // Eğer B2B Talep ise:
    if (this.cartData.primaryAction === CartActionType.B2BPurchaseRequest || this.cartData.primaryAction === CartActionType.RequestFromManager) {
        this.cartService.createPurchaseRequest(this.requestNote).subscribe({
            next: (res) => {
                this.isProcessing = false;
                if (res.header && res.header.result) {
                    alert("Talebiniz başarıyla oluşturuldu.");
                    this.router.navigate(['/']); 
                } else {
                    alert(res.header.message || "Talep oluşturulurken bir hata oluştu.");
                }
            },
            error: (err) => {
                this.isProcessing = false;
                alert("Sunucu ile iletişimde bir hata oluştu.");
            }
        });
    } 
    else if (this.cartData.primaryAction === CartActionType.Checkout) {
        // Eğer Bireysel Kullanıcı Checkout yapıyorsa (Sanal POS vs.)
        alert("Bireysel ödeme sistemi (Sanal POS) entegrasyonu yakında eklenecektir.");
        this.isProcessing = false;
        // this.router.navigate(['/checkout']);
    }
  }

  applyCoupon() {
    if (!this.couponCode) return;
    alert("Kupon sistemi yakında aktif olacak.");
    this.couponCode = '';
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  handleMissingImage(event: Event) {
      (event.target as HTMLImageElement).src = 'assets/images/defaults/default.jpg';
  }
}