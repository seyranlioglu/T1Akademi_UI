import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-exam-sidebar',
  templateUrl: './exam-sidebar.component.html',
  styleUrls: ['./exam-sidebar.component.scss'],
  standalone: false
})
export class ExamSidebarComponent implements OnInit, OnChanges {

  @Input() examData: any; // Runner'dan gelen examContext
  @Input() currentSeq: number = 1; // Aktif soru sırası
  @Output() selectQuestion = new EventEmitter<number>();

  // UI İçin Hazırlanmış Liste
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

  // Backend'den detaylı soru haritası gelene kadar simülasyon yapıyoruz.
  // Şu an elimizde TotalQuestionCount var.
  buildMap() {
    if (!this.examData) return;

    this.topicMap = [];
    const total = this.examData.totalQuestionCount || 0;
    const topicNames = this.examData.topicsNames || ['Genel'];

    // Basit dağılım (Gerçek senaryoda backend her konuya kaç soru düştüğünü dönmeli)
    // Şimdilik tüm soruları ilk başlığa veya tek bir listeye gömelim.
    
    let currentQ = 1;
    
    // Eğer konu isimleri varsa ama sayı dağılımı yoksa, hepsini tek başlıkta gösterelim
    // İleride backend'den "Topic A: [1,2,3], Topic B: [4,5]" gibi veri gelirse burayı güncelleriz.
    const questions = [];
    for (let i = 1; i <= total; i++) {
      questions.push({ seq: i, isAnswered: false }); // isAnswered durumunu ileride yöneteceğiz
    }

    this.topicMap.push({
      title: 'Sınav Soruları',
      questions: questions
    });
  }

  onSelect(seq: number) {
    if (seq === this.currentSeq) return;
    this.selectQuestion.emit(seq);
  }
}