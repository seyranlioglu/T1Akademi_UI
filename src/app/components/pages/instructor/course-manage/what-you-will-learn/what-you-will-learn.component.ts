import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { TrainingAttributeDto } from 'src/app/shared/models/get-training.model';

type TabType = 'learning' | 'requirement' | 'audience' | 'tag';

@Component({
  selector: 'app-what-you-will-learn',
  templateUrl: './what-you-will-learn.component.html',
  styleUrls: ['./what-you-will-learn.component.scss']
})
export class WhatYouWillLearnComponent implements OnInit {

  trainingId!: number;
  isLoading = false;
  activeTab: TabType = 'learning';

  // 4 Farklı Liste
  learnings: TrainingAttributeDto[] = []; 
  requirements: TrainingAttributeDto[] = [];
  audiences: TrainingAttributeDto[] = [];
  tags: TrainingAttributeDto[] = [];
  
  // Inputlar
  inputs = {
    learning: '',
    requirement: '',
    audience: '',
    tag: ''
  };

  constructor(
    private route: ActivatedRoute,
    private trainingApi: TrainingApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      if (params['id']) {
        this.trainingId = +params['id'];
        this.loadData();
      }
    });
  }

  loadData() {
    this.isLoading = true;
    this.trainingApi.getTrainingById(this.trainingId).subscribe({
      next: (res) => {
        this.learnings = res.whatYouWillLearns || [];
        this.requirements = res.requirements || [];
        this.audiences = res.targetAudiences || [];
        this.tags = res.tags || [];
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Veriler yüklenemedi.');
        this.isLoading = false;
      }
    });
  }

  switchTab(tab: TabType) {
    this.activeTab = tab;
  }

  // TEKİL EKLEME (Backend'e sadece yeni satırı gönderir)
  add(type: TabType) {
    const val = this.inputs[type].trim();
    if (!val) return;

    // Enum Tipi Belirle (Backend Enum: 1=Learning, 2=Req, 3=Audience, 4=Tag)
    let enumType = 1;
    let currentList: TrainingAttributeDto[] = [];

    if (type === 'learning') { enumType = 1; currentList = this.learnings; }
    else if (type === 'requirement') { enumType = 2; currentList = this.requirements; }
    else if (type === 'audience') { enumType = 3; currentList = this.audiences; }
    else if (type === 'tag') { enumType = 4; currentList = this.tags; }

    const payload = {
        trainingId: this.trainingId,
        attributeType: enumType,
        value: val,
        order: currentList.length + 1
    };

    this.trainingApi.addTrainingAttribute(payload).subscribe({
        next: (res) => {
            // Backend'den dönen gerçek ID ile listeye ekle
            const newItem: TrainingAttributeDto = { 
                id: res.id, 
                value: val, 
                order: payload.order 
            };
            currentList.push(newItem);
            
            this.inputs[type] = ''; // Inputu temizle
            this.toastr.success('Eklendi.');
        },
        error: (err) => {
            console.error(err);
            this.toastr.error('Ekleme başarısız.');
        }
    });
  }

  // TEKİL SİLME (Backend'e sadece ID gönderir)
  remove(type: TabType, index: number, item: TrainingAttributeDto) {
    if (!item.id) return; 

    if(!confirm("Bu maddeyi silmek istediğinize emin misiniz?")) return;

    this.trainingApi.deleteTrainingAttribute(item.id).subscribe({
        next: () => {
             // UI'dan kaldır
             if (type === 'learning') this.learnings.splice(index, 1);
             else if (type === 'requirement') this.requirements.splice(index, 1);
             else if (type === 'audience') this.audiences.splice(index, 1);
             else if (type === 'tag') this.tags.splice(index, 1);
             
             this.toastr.success('Silindi.');
        },
        error: (err) => {
            console.error(err);
            this.toastr.error('Silme işlemi başarısız.');
        }
    });
  }
}