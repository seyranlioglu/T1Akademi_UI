import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DynamicDialogComponent } from '../components/dynamic-dialog.component';
 
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private modalService: NgbModal) { }

  openDialog(options: DialogConfiguration): NgbModalRef {
    const ngbModalRef = this.modalService.open(DynamicDialogComponent);

    ngbModalRef.componentInstance.headerText = options.headerText;
    ngbModalRef.componentInstance.bodyText = options.bodyText;
    ngbModalRef.componentInstance.confirmText = options.confirmText;
    ngbModalRef.componentInstance.cancelText = options.cancelText;
    ngbModalRef.componentInstance.confirmButtonClass = options.confirmButtonClass;
    ngbModalRef.componentInstance.cancelButtonClass = options.cancelButtonClass;
    ngbModalRef.result
      .then(() => {
        if (options.dialogConfirmed) {
          options.dialogConfirmed();
        }
      })
      .catch(() => {
        if (options.dialogCancelled) {
          options.dialogCancelled();
        }
      });

    return ngbModalRef;
  }
}

export interface DialogConfiguration {
    headerText: string,
    bodyText: string,
    confirmText?: string,
    cancelText?: string,
    confirmButtonClass?:string;
    cancelButtonClass?:string;
    dialogConfirmed?: () => void,
    dialogCancelled?: () => void
  }