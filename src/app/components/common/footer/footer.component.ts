import { Component, HostBinding, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
    @HostBinding('class.col-lg-9') isCoursePage = false;

    @Input() showAuthFooter!: boolean;
    @Input() isOnCoursePage: boolean = false;
    private routerSub!: Subscription;

    currentYear: number = new Date().getFullYear();
    
    constructor(private router: Router) { }

    ngOnInit(): void {
        this.routerSub = this.router.events.subscribe(() => {
            const url = this.router.url;        
            this.isCoursePage = /^\/course\/\d+\/watch$/.test(url);
        });
    }

    ngOnDestroy(): void {
        this.routerSub?.unsubscribe();
    }
}
