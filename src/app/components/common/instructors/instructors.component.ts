import { Component } from '@angular/core';

@Component({
    selector: 'app-instructors',
    templateUrl: './instructors.component.html',
    styleUrls: ['./instructors.component.scss']
})
export class InstructorsComponent {

    sectionTitle = [
        {
            subTitle: `ADVISOR`,
            title: `Course Instructors`,
            paragraph: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
        }
    ]
    instructorBox = [
        {
            image: `assets/images/instructors/instructor1.jpg`,
            name: `Earle Goodman`,
            designation: `UI Designer`,
            link: `/instructor-profile`,
            socials: [
                {
                    icon: `bx bxl-facebook`,
                    link: `https://www.facebook.com/`
                },
                {
                    icon: `bx bxl-linkedin`,
                    link: `https://linkedin.com/`
                },
                {
                    icon: `bx bxl-twitter`,
                    link: `https://twitter.com/`
                },
                {
                    icon: `bx bxl-instagram`,
                    link: `https://www.instagram.com/`
                }
            ]
        },
        {
            image: `assets/images/instructors/instructor2.jpg`,
            name: `Sarah Taylor`,
            designation: `Web Developer`,
            link: `/instructor-profile`,
            socials: [
                {
                    icon: `bx bxl-facebook`,
                    link: `https://www.facebook.com/`
                },
                {
                    icon: `bx bxl-linkedin`,
                    link: `https://linkedin.com/`
                },
                {
                    icon: `bx bxl-twitter`,
                    link: `https://twitter.com/`
                },
                {
                    icon: `bx bxl-instagram`,
                    link: `https://www.instagram.com/`
                }
            ]
        },
        {
            image: `assets/images/instructors/instructor3.jpg`,
            name: `Mickey Hunter`,
            designation: `Digital Marketer`,
            link: `/instructor-profile`,
            socials: [
                {
                    icon: `bx bxl-facebook`,
                    link: `https://www.facebook.com/`
                },
                {
                    icon: `bx bxl-linkedin`,
                    link: `https://linkedin.com/`
                },
                {
                    icon: `bx bxl-twitter`,
                    link: `https://twitter.com/`
                },
                {
                    icon: `bx bxl-instagram`,
                    link: `https://www.instagram.com/`
                }
            ]
        },
        {
            image: `assets/images/instructors/instructor4.jpg`,
            name: `Norris Weeks`,
            designation: `WordPress Expert`,
            link: `/instructor-profile`,
            socials: [
                {
                    icon: `bx bxl-facebook`,
                    link: `https://www.facebook.com/`
                },
                {
                    icon: `bx bxl-linkedin`,
                    link: `https://linkedin.com/`
                },
                {
                    icon: `bx bxl-twitter`,
                    link: `https://twitter.com/`
                },
                {
                    icon: `bx bxl-instagram`,
                    link: `https://www.instagram.com/`
                }
            ]
        }
    ]

}