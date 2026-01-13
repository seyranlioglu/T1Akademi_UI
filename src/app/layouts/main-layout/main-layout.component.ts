import { Component, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/shared/services/sidebar.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  isSidebarCollapsed: boolean = true;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    // Sidebar'ın durumunu dinle ki içeriği (margin-left) ona göre genişletip daraltalım
    this.sidebarService.isCollapsed$.subscribe(status => {
      this.isSidebarCollapsed = status;
    });
  }
}