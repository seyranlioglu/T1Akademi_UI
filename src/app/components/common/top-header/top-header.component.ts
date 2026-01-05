import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-top-header',
    templateUrl: './top-header.component.html',
    styleUrls: ['./top-header.component.scss']
})
export class TopHeaderComponent {

    constructor(
        public router: Router
    ) { }

}