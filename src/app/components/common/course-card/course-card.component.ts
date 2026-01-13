import { Component, Input, OnInit } from '@angular/core';
import { TrainingCard } from 'src/app/shared/models/training-card.model';

@Component({
  selector: 'app-course-card',
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.scss']
})
export class CourseCardComponent implements OnInit {
  @Input() training!: TrainingCard; // Parent'tan veri bekler

  constructor() { }

  ngOnInit(): void {
  }
}