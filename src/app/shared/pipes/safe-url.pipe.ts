import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    // Angular'a "Bu URL güvenlidir, engelleme" diyoruz
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}