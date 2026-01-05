import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-featured-boxes',
    templateUrl: './featured-boxes.component.html',
    styleUrls: ['./featured-boxes.component.scss']
})
export class FeaturedBoxesComponent {

    constructor(
        public router: Router
    ) { }

    featuredBox = [
        {
            icon: `assets/images/featured/icon5.png`,
            title: `Expert Teacher`,
            paragraph: `It is a long establishereader will be distracted by threadab content.`
        },
        {
            icon: `assets/images/featured/icon6.gif`,
            title: `Self Development`,
            paragraph: `It is a long establishereader will be distracted by threadab content.`
        },
        {
            icon: `assets/images/featured/icon7.gif`,
            title: `Remote Learning`,
            paragraph: `It is a long establishereader will be distracted by threadab content.`
        },
        {
            icon: `assets/images/featured/icon8.gif`,
            title: `Life Time Support`,
            paragraph: `It is a long establishereader will be distracted by threadab content.`
        }
    ]

}