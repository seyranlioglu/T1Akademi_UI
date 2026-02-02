import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest, HttpEvent } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'; // PrimeNG Importları
import { UploadModalComponent } from 'src/app/components/common/modals/upload-modal/upload-modal.component';

export interface UploadItem {
  id: string;
  file: File;
  metaData: { title: string; description: string; [key: string]: any };
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalUploadService {
  private baseUrl = environment.apiUrl + '/ContentLibrary';
  
  private uploadsSubject = new BehaviorSubject<UploadItem[]>([]);
  public uploads$ = this.uploadsSubject.asObservable();

  public onUploadFinished = new EventEmitter<void>();
  
  // Modal Referansı (Kapatmak istersek diye)
  private ref: DynamicDialogRef | undefined;

  constructor(
      private http: HttpClient,
      private dialogService: DialogService // PrimeNG Dialog Service
  ) { }

  // --- MODAL AÇMA METODU ---
  openUploadDialog() {
      this.ref = this.dialogService.open(UploadModalComponent, {
          header: 'Yeni İçerik Yükle',
          width: '50vw',
          contentStyle: { "overflow": "auto" },
          baseZIndex: 10000,
          maximizable: true,
          closeOnEscape: false, // Yükleme sırasında yanlışlıkla kapanmasın
          closable: true 
      });

      // Modal kapandığında tetiklenecek işlemler (gerekirse)
      this.ref.onClose.subscribe(() => {
          // Modal kapandı
      });
  }

  // ... (Diğer startUpload, uploadFileActual vb. metodlar aynen kalıyor) ...
  
  startUpload(file: File, metaData: any) {
    const tempWidgetId = Date.now().toString();
    const newItem: UploadItem = { id: tempWidgetId, file: file, metaData: metaData, progress: 0, status: 'pending' };
    this.addUploadToList(newItem);

    this.http.post<any>(`${this.baseUrl}/Initialize`, { 
        title: metaData.title, 
        description: metaData.description || '' 
    }).subscribe({
        next: (res) => {
            // Response yapısı: res.data veya res.body olabilir, backend'e göre ayarla
            // Senin backend common response dönüyorsa: res.data.id
            const result = res.data || res.body || res;
            if (result && result.id) {
                this.uploadFileActual(result.id, file, tempWidgetId);
            } else {
                this.updateItemState(tempWidgetId, { status: 'error', message: 'Başlatma hatası.' });
            }
        },
        error: (err) => {
            console.error(err);
            this.updateItemState(tempWidgetId, { status: 'error', message: 'Sunucu hatası.' });
        }
    });
  }

  private uploadFileActual(dbId: number, file: File, widgetItemId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', dbId.toString());

    const req = new HttpRequest('POST', `${this.baseUrl}/UploadFile`, formData, { reportProgress: true });
    this.updateItemState(widgetItemId, { status: 'uploading' });

    this.http.request(req).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = Math.round(100 * event.loaded / (event.total || 1));
          this.updateItemState(widgetItemId, { progress: percent });
        } else if (event.type === HttpEventType.Response) {
             this.updateItemState(widgetItemId, { status: 'completed', progress: 100 });
             this.onUploadFinished.emit(); // Listeyi yenile
             setTimeout(() => this.removeUpload(widgetItemId), 5000);
        }
      },
      error: () => this.updateItemState(widgetItemId, { status: 'error', message: 'Yükleme hatası.' })
    });
  }

  private addUploadToList(item: UploadItem) {
    this.uploadsSubject.next([...this.uploadsSubject.value, item]);
  }

  private updateItemState(id: string, changes: Partial<UploadItem>) {
    const current = this.uploadsSubject.value;
    const index = current.findIndex(u => u.id === id);
    if (index > -1) {
      current[index] = { ...current[index], ...changes };
      this.uploadsSubject.next([...current]);
    }
  }

  public removeUpload(id: string) {
    this.uploadsSubject.next(this.uploadsSubject.value.filter(u => u.id !== id));
  }
}