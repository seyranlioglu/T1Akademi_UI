import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-partner',
    templateUrl: './partner.component.html',
    styleUrls: ['./partner.component.scss']
})
export class PartnerComponent {

    constructor(
        public router: Router
    ) { }

    partnerContent = [
        {
            title: `Our Global Honorable Partners`,
            list: [
                {
                    img: `assets/images/partners/partner1.png`
                },
                {
                    img: `assets/images/partners/partner2.png`
                },
                {
                    img: `assets/images/partners/partner3.png`
                },
                {
                    img: `assets/images/partners/partner4.png`
                },
                {
                    img: `assets/images/partners/partner5.png`
                }
            ]
        }
    ]

}