import { Component } from '@angular/core';

@Component({
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrls: ['./video.component.scss']
})
export class VideoComponent {

    isOpen = false;

    openPopup(): void {
        this.isOpen = true;
    }

    closePopup(): void {
        this.isOpen = false;
    }

}