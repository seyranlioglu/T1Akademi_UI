import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-exam-sidebar',
  templateUrl: './exam-sidebar.component.html',
  styleUrls: ['./exam-sidebar.component.scss'],
  standalone: false
})
export class ExamSidebarComponent implements OnInit, OnChanges {

  @Input() examData: any; 
  @Input() currentSeq: number = 1;
  @Output() selectQuestion = new EventEmitter<number>();

  topicMap: any[] = [];

  constructor() { }

  ngOnInit(): void {
    this.buildMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['examData'] && this.examData) {
      this.buildMap();
    }
  }

  buildMap() {
    if (!this.examData) return;

    this.topicMap = [];
    
    // Eğer backend 'ExamTopics' listesini dönüyorsa (PrePrepare veya Preview'da)
    if (this.examData.examTopics && this.examData.examTopics.length > 0) {
        
        let globalSeq = 1;

        this.examData.examTopics.forEach((topic: any) => {
            const questions = [];
            
            // Konuya ait soru sayısı kadar döngü
            // Eğer backend topic.questionCount dönüyorsa onu kullan, yoksa manuel dağıt
            const count = topic.questionCount || topic.questions?.length || 0;

            for (let i = 0; i < count; i++) {
                questions.push({ 
                    seq: globalSeq, 
                    isAnswered: false // Başlangıçta boş, runner'dan güncelleyeceğiz
                });
                globalSeq++;
            }

            this.topicMap.push({
                title: topic.title || 'Genel Konu',
                questions: questions
            });
        });

    } else {
        // Fallback: Eski düz liste mantığı
        const total = this.examData.totalQuestionCount || 0;
        const questions = [];
        for (let i = 1; i <= total; i++) {
            questions.push({ seq: i, isAnswered: false });
        }
        this.topicMap.push({ title: 'Sınav Soruları', questions: questions });
    }
  }

  // 🔥 Parent (Runner) bu metodu çağırarak Sidebar'ı güncelleyecek
  public setQuestionAnswered(seq: number) {
      for (const topic of this.topicMap) {
          const q = topic.questions.find((x: any) => x.seq === seq);
          if (q) {
              q.isAnswered = true;
              break;
          }
      }
  }

  onSelect(seq: number) {
    if (seq === this.currentSeq) return;
    this.selectQuestion.emit(seq);
  }
}