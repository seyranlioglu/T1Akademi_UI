import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-courses-toledo',
    templateUrl: './courses.component.html',
    styleUrls: ['./courses.component.scss']
})
export class CoursesToledoComponent {

    constructor(
        public router: Router
    ) { }

    // for tab click event
    currentTab = 'tab1';
    switchTab(event: MouseEvent, tab: string) {
        event.preventDefault();
        this.currentTab = tab;
    }

}