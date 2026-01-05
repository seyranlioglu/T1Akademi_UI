import { Component } from '@angular/core';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss']
})
export class OverviewComponent {

    overviewBox = [
        {
            bgImage: `assets/images/overview/overview1.jpg`,
            title: `Online Courses form Toledo University`,
            subTitle: `New Certificate`,
            buttonText: `Find Out More`,
            buttonLink: `/courses-grid`
        },
        {
            bgImage: `assets/images/overview/overview2.jpg`,
            title: `Master Your Coding Skills In Toledo`,
            subTitle: `Best Instructors`,
            buttonText: `View Courses`,
            buttonLink: `/courses-grid`
        }
    ]

}