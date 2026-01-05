import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-funfacts',
    templateUrl: './funfacts.component.html',
    styleUrls: ['./funfacts.component.scss']
})
export class FunfactsComponent {

    constructor(
        public router: Router
    ) { }

    funfactBox = [
        {
            icon: `flaticon-document`,
            number: `8293`,
            title: `Student Enrolled`
        },
        {
            icon: `flaticon-skills`,
            number: `2593`,
            title: `Class Completed`
        },
        {
            icon: `flaticon-teacher`,
            number: `393`,
            title: `Top Instructors`
        },
        {
            icon: `flaticon-teacher`,
            number: `100%`,
            title: `Satisfaction Rate`
        }
    ]

}