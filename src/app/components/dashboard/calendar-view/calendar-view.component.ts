import { Component, Input, OnInit } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core'; // EventInput eklendi
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import trLocale from '@fullcalendar/core/locales/tr';
import { TrainingCard } from 'src/app/shared/models/dashboard.model';

@Component({
  selector: 'app-calendar-view',
  template: `
    <div class="calendar-card card border-0 shadow-sm p-4 animate__animated animate__fadeIn">
      <full-calendar [options]="calendarOptions"></full-calendar>
    </div>
  `,
  styles: [`
    .calendar-card { min-height: 650px; background: white; border-radius: 15px; }
    :host ::ng-deep .fc { 
      font-family: 'Spartan', sans-serif;
      --fc-button-bg-color: #1c1d1f;
      --fc-button-border-color: #1c1d1f;
      --fc-event-resizer-thickness: 10px;
    }
    :host ::ng-deep .fc-event { cursor: pointer; padding: 2px 5px; font-weight: 600; }
    :host ::ng-deep .fc-toolbar-title { font-size: 1.5rem; font-weight: 700; color: #333; }
    :host ::ng-deep .fc-day-today { background-color: rgba(86, 36, 208, 0.05) !important; }
  `]
})
export class CalendarViewComponent implements OnInit {
  @Input() trainings: TrainingCard[] = [];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    locale: trLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [], // Başlangıçta boş
    eventClick: (info) => {
        const id = info.event.extendedProps['trainingId'];
        // Burada Angular router ile gitmek daha SPA dostudur ama href de çalışır.
        window.location.href = `/course/${id}`;
    }
  };

  ngOnInit() {
    // Veriler yüklendiğinde haritalamayı yap
    this.mapTrainingsToEvents();
  }

  // Input değişirse (örn: asenkron veri geç gelirse) takvimi güncellemek için
  ngOnChanges() {
    this.mapTrainingsToEvents();
  }

  mapTrainingsToEvents() {
    if (!this.trainings) return;

    // TypeScript hatasını önlemek için EventInput[] tipini belirtiyoruz
    const events: EventInput[] = this.trainings.map(t => {
      
      // Tarih mantığı: StartDate veya DueDate yoksa CreatedDate(AssignDate)'i baz al
      let start: any = t.startDate || t.dueDate || t.assignDate;
      
      // Bitiş tarihi varsa FullCalendar için düzenle
      let endInput: Date | undefined; // Burası null olamaz, undefined olmalı

      if (t.dueDate) {
        endInput = new Date(t.dueDate);
        // FullCalendar bitiş gününü "hariç" (exclusive) tutar. 
        // Yani ayın 12'sinde bitiyorsa, barın 12'sini kapsaması için 13'ü dememiz gerekir.
        endInput.setDate(endInput.getDate() + 1); 
      }

      // Tüm gün mü? (Eğer bir aralık değil tek bir tarihse)
      const isAllDay = !t.startDate || !t.dueDate;

      return {
        id: t.id.toString(),
        title: t.title,
        start: start,
        end: endInput, // Artık hata vermeyecek çünkü undefined olabilir ama null olamaz
        allDay: isAllDay,
        // Renk Kodlaması: Tamamlandı(Yeşil), Süresi Geçti(Kırmızı), Aktif(Mor)
        backgroundColor: t.isCompleted ? '#258754' : (t.accessStatus === 'Expired' ? '#ff1949' : '#5624d0'),
        borderColor: 'transparent',
        extendedProps: { trainingId: t.id }
      };
    });

    this.calendarOptions.events = events;
  }
}