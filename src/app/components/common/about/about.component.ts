import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent {

    constructor(
        public router: Router
    ) { }

    isOpen = false;

    openPopup(): void {
        this.isOpen = true;
    }

    closePopup(): void {
        this.isOpen = false;
    }

}