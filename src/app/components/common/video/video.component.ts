import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrls: ['./video.component.scss']
})
export class VideoComponent {

    // 🔥 Bu Input'ları ekledik ki dışarıdan veri alabilsin
    @Input() url: string | undefined;
    @Input() tumb: string | undefined;

    isOpen = false;

    openPopup(): void {
        this.isOpen = true;
    }

    closePopup(): void {
        this.isOpen = false;
    }

}