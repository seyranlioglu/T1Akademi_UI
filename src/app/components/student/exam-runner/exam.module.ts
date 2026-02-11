import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // ngIf, ngFor için şart
import { ExamRunnerComponent } from './exam-runner.component';
import { ExamSidebarComponent } from './exam-sidebar/exam-sidebar.component';
import { ExamQuestionComponent } from './exam-question/exam-question.component';

@NgModule({
  declarations: [
    ExamRunnerComponent,
    ExamSidebarComponent,
    ExamQuestionComponent
  ],
  imports: [
    CommonModule // 🔥 Bunu unutma, HTML'deki *ngIf'ler bununla çalışır
  ],
  exports: [
    ExamRunnerComponent // 🔥 PlayerLayout'ta kullanabilmek için dışarı açıyoruz
  ]
})
export class ExamModule { }