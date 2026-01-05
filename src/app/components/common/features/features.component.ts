import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-features',
    templateUrl: './features.component.html',
    styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {

    constructor(
        public router: Router
    ) { }

    featuresContent = [
        {
            image1: `assets/images/features/feature1.jpg`,
            image2: `assets/images/features/feature2.jpg`,
            image3: `assets/images/features/feature3.jpg`,
            title: `Differentiate Your Classroom What Makes Us Special`,
            paragraph: `There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't loefven slightly believable. If you are going to use a passage.`,
            list: [
                {
                    title: `Flexible Training Programs`
                },
                {
                    title: `Learn From Approved Experts`
                },
                {
                    title: `Friendly Environment for You`
                },
                {
                    title: `Boost Your Knowledge`
                }
            ],
            buttonText: `Get Started Now`,
            buttonLink: `/courses-grid`
        }
    ]
    featuresText = [
        {
            image1: `assets/images/features/feature4.jpg`,
            image2: `assets/images/features/feature5.jpg`,
            title: `Affordable Online Courses And Learning Opportunities`,
            paragraph: `It is a long established fact that a reader will be distracted by the readable contenwhen looking at its layout. The point of using Lorem Ipsum is that it has.`,
            list: [
                {
                    title: `Flexible Classes`
                },
                {
                    title: `Offline Mode`
                },
                {
                    title: `Educator Support`
                },
                {
                    title: `Flexible Learning`
                }
            ],
            buttonText: `View All Stories`,
            buttonLink: `/stories`
        }
    ]

}