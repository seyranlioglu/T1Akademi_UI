import { Component } from '@angular/core';

@Component({
    selector: 'app-instructors-page',
    templateUrl: './instructors-page.component.html',
    styleUrls: ['./instructors-page.component.scss']
})
export class InstructorsPageComponent {

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
        },
        {
            image: `assets/images/instructors/instructor5.jpg`,
            name: `Frederic Curry`,
            designation: `WoedPress Expert`,
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
            image: `assets/images/instructors/instructor6.jpg`,
            name: `Mitchel Bernard`,
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
            image: `assets/images/instructors/instructor7.jpg`,
            name: `Antwan Perkins`,
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
            image: `assets/images/instructors/instructor8.jpg`,
            name: `Homer Ramirez`,
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
        }
    ]

}