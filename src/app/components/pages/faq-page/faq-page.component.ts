import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-faq-page',
    templateUrl: './faq-page.component.html',
    styleUrls: ['./faq-page.component.scss']
})
export class FaqPageComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {}

    accordionItems = [
        {
            title: 'How long it take to create a video course?',
            content: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable Desktop is publishing packages and web page editors now use Lorem Ipsum as their default model text.`,
            open: false
        },
        {
            title: 'Do I have to be a student to take an online course?',
            content: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable Desktop is publishing packages and web page editors now use Lorem Ipsum as their default model text.`,
            open: false
        },
        {
            title: 'How old do I have to be to take an online class?',
            content: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable Desktop is publishing packages and web page editors now use Lorem Ipsum as their default model text.`,
            open: false
        },
        {
            title: 'What are the technical requirements for an online course?',
            content: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable Desktop is publishing packages and web page editors now use Lorem Ipsum as their default model text.`,
            open: false
        },
        {
            title: 'May I take a class as non-credit and pay a reduced tuition?',
            content: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable Desktop is publishing packages and web page editors now use Lorem Ipsum as their default model text.`,
            open: false
        },
        {
            title: 'What is the difference between a refund and a purchase reversal?',
            content: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable Desktop is publishing packages and web page editors now use Lorem Ipsum as their default model text.`,
            open: false
        }
    ];

    selectedItem : any = null;

    toggleAccordionItem(item:any) {
        item.open = !item.open;
        if (this.selectedItem && this.selectedItem !== item) {
            this.selectedItem.open = false;
        }
        this.selectedItem = item;
    }

}