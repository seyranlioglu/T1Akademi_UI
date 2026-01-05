import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-performance',
    templateUrl: './performance.component.html',
    styleUrls: ['./performance.component.scss'],
})
export class PerformanceComponent {
    constructor(public router: Router) {}
}
