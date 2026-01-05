import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
    courseList: any[] = [];
    constructor(public trainingApiService: TrainingApiService, public router: Router) { }

    ngOnInit(): void {
        this.trainingApiService.getTrainings().subscribe((response: any) => {
            console.log(response);
            if (response.body) {
                this.courseList = response.body;
            }
        });
    }
}