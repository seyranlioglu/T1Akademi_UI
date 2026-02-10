import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamSelectorComponent } from './exam-selector.component';

describe('ExamSelectorComponent', () => {
  let component: ExamSelectorComponent;
  let fixture: ComponentFixture<ExamSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExamSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
