import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentPreviewModalComponent } from './content-preview-modal.component';

describe('ContentPreviewModalComponent', () => {
  let component: ContentPreviewModalComponent;
  let fixture: ComponentFixture<ContentPreviewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentPreviewModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContentPreviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
