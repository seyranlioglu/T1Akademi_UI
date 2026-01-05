import { Component, Input, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dynamic-dialog',
  template: `
    <div class="modal-header" style="border: none;">
      <h5 class="modal-title">{{ headerText }}</h5>
      <button type="button" class="close btn-close" (click)="closeDialog()"></button>
    </div>
    <div class="modal-body">
      <p>{{ bodyText }}</p>
    </div>
    <div class="modal-footer" style="border: none;">
      <button *ngIf="cancelText" type="button" class="btn"  [ngClass]="cancelButtonClass ? cancelButtonClass : ''" (click)="onCancelClick()">{{ cancelText }}</button>
      <button *ngIf="confirmText" type="button" class="btn"  [ngClass]="confirmButtonClass ? confirmButtonClass : 'btn-primary'" (click)="onConfirmClick()">{{ confirmText }}</button>
    </div>
  `
})
export class DynamicDialogComponent {
  @Input() headerText!: string;
  @Input() bodyText!: string;
  @Input() confirmText!: string;
  @Input() cancelText!: string;
  @Input() confirmButtonClass!: string;
  @Input() cancelButtonClass!: string;
  @Output() dialogConfirmed = new EventEmitter<void>();
  @Output() dialogCancelled = new EventEmitter<void>();
  constructor(public activeModal: NgbActiveModal){}

  closeDialog() {
    this.onCancelClick();
  }

  onConfirmClick() {
    this.activeModal.close();
    this.dialogConfirmed.emit();
  }

  onCancelClick() {
    this.activeModal.dismiss();
    this.dialogCancelled.emit();
  }
}
