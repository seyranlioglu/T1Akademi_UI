import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest, HttpEvent } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

// Widget'ta gösterilecek öğenin yapısı
export interface UploadItem {
  id: string; // Widget için geçici ID (Listede takibi için)
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
  // API Controller Yolu
  private baseUrl = environment.apiUrl + '/ContentLibrary';
  
  // Widget için State Yönetimi (Aktif yüklemeler listesi)
  private uploadsSubject = new BehaviorSubject<UploadItem[]>([]);
  public uploads$ = this.uploadsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // =================================================================================================
  // 1. AŞAMA: BAŞLATMA (Initialize)
  // Kullanıcı "Yükle" butonuna bastığında burası çağrılır.
  // =================================================================================================
  startUpload(file: File, metaData: any) {
    // Widget'ta göstermek için geçici bir ID oluşturuyoruz (Timestamp)
    const tempWidgetId = Date.now().toString();
    
    // Listeye 'Pending' (Bekliyor) olarak ekle
    const newItem: UploadItem = {
      id: tempWidgetId,
      file: file,
      metaData: metaData,
      progress: 0,
      status: 'pending' 
    };
    this.addUploadToList(newItem);

    // Backend'e gidip Kayıt Aç (Initialize Endpoint)
    // Beklenen Response Yapısı: { header: { result: true }, body: { id: 90 } }
    this.http.post<any>(`${this.baseUrl}/Initialize`, { 
        title: metaData.title, 
        description: metaData.description || '' 
    }).subscribe({
        next: (res) => {
            // Response Wrapper Kontrolü
            if (res && res.header && res.header.result === true) {
                // Başarılı: Backend'den gerçek ID'yi al
                // Not: Loglarında body: { id: 90 } olarak görünüyor.
                const realDbId = res.body.id; 
                
                // 2. Aşamaya Geç: Dosyayı Yükle
                this.uploadFileActual(realDbId, file, tempWidgetId);
            } else {
                // Başarısız: Hata mesajını göster
                const errorMsg = res?.header?.msg || 'Başlatma işlemi başarısız.';
                this.updateItemState(tempWidgetId, { status: 'error', message: errorMsg });
            }
        },
        error: (err) => {
            console.error('Upload Initialize Error:', err);
            this.updateItemState(tempWidgetId, { status: 'error', message: 'Sunucuya erişilemedi.' });
        }
    });
  }

  // =================================================================================================
  // 2. AŞAMA: FİZİKSEL DOSYA YÜKLEME (UploadFile)
  // Kayıt açıldıktan sonra ID ile dosyayı gönderir.
  // =================================================================================================
  private uploadFileActual(dbId: number, file: File, widgetItemId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', dbId.toString()); // Backend bu ID'ye göre update yapacak

    // Dosya yükleme isteği (Progress Report Açık)
    const req = new HttpRequest('POST', `${this.baseUrl}/UploadFile`, formData, {
      reportProgress: true
    });

    // Durumu 'Uploading' yap (Widget rengi değişsin)
    this.updateItemState(widgetItemId, { status: 'uploading' });

    this.http.request(req).subscribe({
      next: (event: HttpEvent<any>) => {
        // A. Yükleme Devam Ediyor
        if (event.type === HttpEventType.UploadProgress) {
          // Yüzdelik hesapla
          const percent = Math.round(100 * event.loaded / (event.total || 1));
          this.updateItemState(widgetItemId, { progress: percent });
        } 
        // B. Yükleme Bitti (Sunucudan Cevap Geldi)
        else if (event.type === HttpEventType.Response) {
          const body = event.body;

          // Response Wrapper Kontrolü
          // Beklenen: { header: { result: true }, body: { ... } }
          if (body && body.header && body.header.result === true) {
             // Başarılı
             this.updateItemState(widgetItemId, { status: 'completed', progress: 100 });
             
             // 5 Saniye sonra widget listesinden sil
             setTimeout(() => this.removeUpload(widgetItemId), 5000);
          } else {
             // Sunucu hata döndü
             const errorMsg = body?.header?.msg || 'Yükleme başarısız.';
             this.updateItemState(widgetItemId, { status: 'error', message: errorMsg });
          }
        }
      },
      error: (err) => {
        console.error('Upload File Error:', err);
        this.updateItemState(widgetItemId, { status: 'error', message: 'Yükleme kesildi.' });
      }
    });
  }

  // =================================================================================================
  // STATE YÖNETİMİ (HELPER METOTLAR)
  // Widget listesini yöneten yardımcı fonksiyonlar
  // =================================================================================================

  // Listeye yeni eleman ekle
  private addUploadToList(item: UploadItem) {
    const current = this.uploadsSubject.value;
    this.uploadsSubject.next([...current, item]);
  }

  // Listedeki bir elemanın durumunu güncelle (Progress, Status vb.)
  private updateItemState(id: string, changes: Partial<UploadItem>) {
    const current = this.uploadsSubject.value;
    const index = current.findIndex(u => u.id === id);
    if (index > -1) {
      const updatedItem = { ...current[index], ...changes };
      const newList = [...current];
      newList[index] = updatedItem;
      this.uploadsSubject.next(newList);
    }
  }

  // Listeden eleman sil
  public removeUpload(id: string) {
    const current = this.uploadsSubject.value.filter(u => u.id !== id);
    this.uploadsSubject.next(current);
  }
}