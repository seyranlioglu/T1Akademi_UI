import { Component } from '@angular/core';

@Component({
    selector: 'app-testimonials-page',
    templateUrl: './testimonials-page.component.html',
  styleUrls: ['./testimonials-page.component.scss']
})
export class TestimonialsPageComponent {

    feedbackBox = [
        {
            userImg: `assets/images/users/user1.jpg`,
            userName: `Phillip Randolph`,
            userDesignation: `Designer`,
            description: `“It is a long established fact that a reader by the readable content of a page whelooking layout. The point ofIphas a morless.”`,
            rating: [
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                }
            ]
        },
        {
            userImg: `assets/images/users/user2.jpg`,
            userName: `Numbers Collins`,
            userDesignation: `Developer`,
            description: `“It is a long established fact that a reader by the readable content of a page whelooking layout. The point ofIphas a morless.”`,
            rating: [
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star-half`
                }
            ]
        },
        {
            userImg: `assets/images/users/user3.jpg`,
            userName: `David Warner`,
            userDesignation: `Developer`,
            description: `“It is a long established fact that a reader by the readable content of a page whelooking layout. The point ofIphas a morless.”`,
            rating: [
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bx-star`
                }
            ]
        },
        {
            userImg: `assets/images/users/user4.jpg`,
            userName: `James Andy`,
            userDesignation: `Designer`,
            description: `“It is a long established fact that a reader by the readable content of a page whelooking layout. The point ofIphas a morless.”`,
            rating: [
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                }
            ]
        },
        {
            userImg: `assets/images/users/user5.jpg`,
            userName: `Alina Smith`,
            userDesignation: `Developer`,
            description: `“It is a long established fact that a reader by the readable content of a page whelooking layout. The point ofIphas a morless.”`,
            rating: [
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star-half`
                }
            ]
        },
        {
            userImg: `assets/images/users/user6.jpg`,
            userName: `Sarah Taylor`,
            userDesignation: `Developer`,
            description: `“It is a long established fact that a reader by the readable content of a page whelooking layout. The point ofIphas a morless.”`,
            rating: [
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bxs-star`
                },
                {
                    icon: `bx bx-star`
                }
            ]
        }
    ]

}