import { Component } from '@angular/core';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';

@Component({
  selector: 'app-active-courses',
  templateUrl: './active-courses.component.html',
  styleUrls: ['./active-courses.component.scss']
})
export class ActiveCoursesComponent {

  courseList: any[] = [];

  constructor(public trainingApiService: TrainingApiService,) { }

  ngOnInit(): void {
    this.trainingApiService.getTrainings().subscribe((response: any) => {
      if (response.body) {
        this.courseList = response.body;
      }
    });
  }
}
