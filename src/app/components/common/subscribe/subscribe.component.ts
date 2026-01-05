import { Component } from '@angular/core';

@Component({
    selector: 'app-subscribe',
    templateUrl: './subscribe.component.html',
    styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent {

    subscribe = [
        {
            title: `Quickly Get Updates About Your Class Event & News`,
            buttonText: `Subscribe Now`,
            placeholderText: `Enter Your Email`
        }
    ]

}