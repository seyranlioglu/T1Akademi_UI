import { Injectable, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExamSecurityService {

  // İhlalleri UI'a bildirmek için
  public onViolation = new EventEmitter<string>();
  
  // Sınav iptali gerekirse tetiklenir
  public onTerminate = new EventEmitter<void>();

  private violationCount = 0;
  private maxViolations = 3; // Parametrik yapılabilir
  private isExamActive = false;

  constructor(@Inject(DOCUMENT) private document: Document) { }

  // Sınav Başladığında Çağır
  startSecurity(maxViolations: number = 3) {
    this.isExamActive = true;
    this.violationCount = 0;
    this.maxViolations = maxViolations;

    this.enableFullScreen();
    this.preventCopyPaste();
    this.startFocusTracking();
  }

  // Sınav Bittiğinde Çağır (Temizlik)
  stopSecurity() {
    this.isExamActive = false;
    this.exitFullScreen();
    this.allowCopyPaste();
    this.stopFocusTracking();
  }

  // 1. Tam Ekran Modu
  private enableFullScreen() {
    const elem = this.document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.error("Tam ekran hatası:", err));
    }
  }

  private exitFullScreen() {
    if (this.document.exitFullscreen && this.document.fullscreenElement) {
      this.document.exitFullscreen().catch(err => console.error("Tam ekrandan çıkış hatası:", err));
    }
  }

  // 2. Kopyala/Yapıştır ve Sağ Tık Engelleme
  private preventCopyPaste() {
    this.document.addEventListener('contextmenu', this.blockEvent);
    this.document.addEventListener('copy', this.blockEvent);
    this.document.addEventListener('cut', this.blockEvent);
    this.document.addEventListener('paste', this.blockEvent);
    // Metin seçimini CSS ile de engelleyeceğiz ama JS ile de garantiye alalım
    this.document.body.style.userSelect = 'none';
  }

  private allowCopyPaste() {
    this.document.removeEventListener('contextmenu', this.blockEvent);
    this.document.removeEventListener('copy', this.blockEvent);
    this.document.removeEventListener('cut', this.blockEvent);
    this.document.removeEventListener('paste', this.blockEvent);
    this.document.body.style.userSelect = 'auto';
  }

  private blockEvent = (e: Event) => {
    if (this.isExamActive) {
      e.preventDefault();
      return false;
    }
    return true;
  }

  // 3. Sekme/Odak Takibi (Focus Tracking)
  private startFocusTracking() {
    this.document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleBlur);
  }

  private stopFocusTracking() {
    this.document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleBlur);
  }

  // Olay: Kullanıcı sekmeyi değiştirdi veya simge durumuna küçülttü
  private handleVisibilityChange = () => {
    if (this.document.hidden && this.isExamActive) {
      this.recordViolation("Sınav sekmesinden ayrıldınız.");
    }
  }

  // Olay: Kullanıcı tarayıcı dışına tıkladı (örn: ikinci monitör, başka uygulama)
  private handleBlur = () => {
    if (this.isExamActive) {
      // Blur bazen çok hassas olabilir, opsiyonel olarak kapatılabilir.
      // Şimdilik violation olarak sayıyoruz.
      this.recordViolation("Sınav ekranı odağını kaybetti.");
    }
  }

  // İhlal Kayıt Mantığı
  private recordViolation(reason: string) {
    if (!this.isExamActive) return;

    this.violationCount++;
    console.warn(`Güvenlik İhlali (${this.violationCount}/${this.maxViolations}): ${reason}`);

    this.onViolation.emit(`${reason} (Uyarı ${this.violationCount}/${this.maxViolations})`);

    if (this.violationCount >= this.maxViolations) {
      this.isExamActive = false; // Döngüye girmesin diye kapatıyoruz
      this.onTerminate.emit();
    }
  }
}