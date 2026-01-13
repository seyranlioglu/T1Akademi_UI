import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: '<router-outlet></router-outlet>'
})
export class DashboardComponent {
    // Dashboard ana bileşeni artık sadece yönlendirme yapıyor.
}


// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Router } from '@angular/router';
// import { TrainingApiService } from 'src/app/shared/api/training-api.service';
// import { SidebarService } from 'src/app/shared/services/sidebar.service';
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-dashboard',
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.scss']
// })
// export class DashboardComponent implements OnInit, OnDestroy {

//   sidebarCollapsed = false;
//   private sidebarSub!: Subscription;
//   courseList: any[] = [];

//   constructor(
//     public trainingApiService: TrainingApiService, 
//     public router: Router,
//     private sidebarService: SidebarService
//   ) { }

//   ngOnInit(): void {
//     // Ekran boyutuna göre sidebar'ın başlangıç durumunu ayarla
//     this.checkInitialScreenSize();

//     // Sidebar aç/kapa durumunu dinle
//     this.sidebarSub = this.sidebarService.isCollapsed$.subscribe(
//       collapsed => this.sidebarCollapsed = collapsed
//     );

//     // Senin eski kodun: Verileri çek
//     this.getTrainings();
//   }

//   checkInitialScreenSize() {
//     const isMobile = window.innerWidth <= 991;
//     this.sidebarService.setCollapsed(isMobile); // Mobilde kapalı (true), Desktopta açık (false) başlat
//   }

//   getTrainings() {
//     this.trainingApiService.getTrainings().subscribe((response: any) => {
//       console.log(response);
//       if (response.body) {
//         this.courseList = response.body;
//       }
//     });
//   }

//   ngOnDestroy(): void {
//     if (this.sidebarSub) {
//       this.sidebarSub.unsubscribe();
//     }
//   }
// }