import { Component } from '@angular/core';
import { GlobalUploadService } from 'src/app/shared/services/global-upload.service';

@Component({
  selector: 'app-upload-widget',
  templateUrl: './upload-widget.component.html',
  styleUrls: ['./upload-widget.component.scss']
})
export class UploadWidgetComponent {
  // Servisten gelen yükleme listesini dinliyoruz
  uploads$ = this.uploadService.uploads$;
  
  // Widget küçültüldü mü?
  isMinimized = false;

  constructor(private uploadService: GlobalUploadService) {}

  // Listeden kaldırma/kapatma
  closeItem(id: string) {
    this.uploadService.removeUpload(id);
  }
}