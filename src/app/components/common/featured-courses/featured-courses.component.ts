import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-featured-courses',
    templateUrl: './featured-courses.component.html',
    styleUrls: ['./featured-courses.component.scss']
})
export class FeaturedCoursesComponent {

    constructor(
        public router: Router
    ) { }

}