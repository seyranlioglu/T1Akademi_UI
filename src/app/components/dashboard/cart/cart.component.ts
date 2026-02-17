import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartViewDto } from 'src/app/shared/services/cart.service';
import { TrainingApiService } from 'src/app/shared/api/training-api.service'; // 🔥 EKLENDİ
import { OwlOptions } from 'ngx-owl-carousel-o'; // 🔥 EKLENDİ

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  cartData: CartViewDto = { cartId: 0, totalAmount: 0, totalItemCount: 0, items: [] };
  isLoading = true;
  couponCode = '';

  // 🔥 YENİ: ÖNERİLEN EĞİTİMLER
  recommendedTrainings: any[] = [];
  
  carouselOptions: OwlOptions = {
      loop: false,
      mouseDrag: true,
      touchDrag: true,
      pullDrag: true,
      dots: false,
      navSpeed: 700,
      navText: ['<i class="bx bx-chevron-left"></i>', '<i class="bx bx-chevron-right"></i>'],
      nav: true,
      margin: 24,
      responsive: {
        0: { items: 1 },
        576: { items: 2 },
        768: { items: 2 },
        992: { items: 3 },
        1200: { items: 4 }
      }
  };

  constructor(
    private cartService: CartService,
    private trainingApi: TrainingApiService, // 🔥 EKLENDİ
    private router: Router
  ) { }

  ngOnInit(): void {
    // Sepeti Dinle
    this.cartService.cart$.subscribe(data => {
      if (data) {
        this.cartData = data;
        this.isLoading = false;
      }
    });

    // 🔥 Önerilenleri Yükle
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

  createPurchaseRequest() {
    if (this.cartData.items.length === 0) return;
    console.log("Satın alma talebi oluşturuluyor...", this.cartData);
    alert("Satın alma talebi oluşturma servisi hazırlanıyor.");
  }

  applyCoupon() {
    if (!this.couponCode) return;
    alert("Kupon sistemi yakında aktif olacak.");
    this.couponCode = '';
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  // Resim Hatası Yönetimi
  handleMissingImage(event: Event) {
      (event.target as HTMLImageElement).src = 'assets/images/defaults/default.jpg';
  }
}