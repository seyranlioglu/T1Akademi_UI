import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Router } from '@angular/router'; // 🔥 Router eklendi
import { CalendarOptions, EventInput } from '@fullcalendar/core'; 
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
    :host ::ng-deep .fc-event { 
      cursor: pointer; 
      padding: 3px 6px; 
      font-weight: 600; 
      border-radius: 4px;
      margin-bottom: 3px;
    }
    :host ::ng-deep .fc-toolbar-title { font-size: 1.5rem; font-weight: 700; color: #333; }
    :host ::ng-deep .fc-day-today { background-color: rgba(86, 36, 208, 0.05) !important; }
  `]
})
export class CalendarViewComponent implements OnInit, OnChanges {
  @Input() trainings: TrainingCard[] = [];

  // 🔥 HARİKA PASTEL RENK PALETİ
  private pastelColors: string[] = [
    '#74b9ff', // Soft Mavi
    '#a29bfe', // Soft Lila
    '#81ecec', // Soft Turkuaz
    '#fab1a0', // Soft Somon
    '#ffeaa7', // Soft Sarı
    '#00cec9', // Koyu Turkuaz (Soft)
    '#fd79a8', // Soft Pembe
    '#e17055', // Toprak Rengi
    '#0984e3', // Okyanus Mavisi
    '#55efc4'  // Soft Nane Yeşili
  ];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    locale: trLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [], 
    eventClick: (info) => {
        const id = info.event.extendedProps['trainingId'];
        // 🔥 Artık sayfayı yenilemeden, SPA hızında Angular ile yönlendiriyor
        window.location.href = `/course/${id}`;
        // this.router.navigate(['/course-details', id]); 
    }
  };

  constructor(private router: Router) {} // 🔥 Router Inject Edildi

  ngOnInit() {
    this.mapTrainingsToEvents();
  }

  ngOnChanges() {
    this.mapTrainingsToEvents();
  }

  // 🔥 Eğitimin ID'sine göre her zaman aynı pastel rengi verir
  getEventColor(trainingId: number): string {
    if (!trainingId) return this.pastelColors[0];
    const index = trainingId % this.pastelColors.length;
    return this.pastelColors[index];
  }

  mapTrainingsToEvents() {
    if (!this.trainings) return;

    const events: EventInput[] = this.trainings.map(t => {
      
      let start: any = t.startDate || t.dueDate || t.assignDate;
      let endInput: Date | undefined; 

      if (t.dueDate) {
        endInput = new Date(t.dueDate);
        endInput.setDate(endInput.getDate() + 1); 
      }

      const isAllDay = !t.startDate || !t.dueDate;

      // Temel rengi ID'ye göre alıyoruz
      let bgColor = this.getEventColor(t.id);

      // İsteğe Bağlı: Duruma göre rengi ezmek istersen (Soft Yeşil ve Soft Kırmızı)
      if (t.isCompleted) bgColor = '#55efc4'; // Tamamlananlar Nane Yeşili
      if (t.accessStatus === 'Expired') bgColor = '#ff7675'; // Bitenler Soft Kırmızı

      return {
        id: t.id.toString(),
        title: t.title,
        start: start,
        end: endInput, 
        allDay: isAllDay,
        backgroundColor: bgColor,
        borderColor: bgColor,
        textColor: '#2d3436', // 🔥 Pastel üzerinde siyah/koyu gri yazı mükemmel okunur
        extendedProps: { trainingId: t.id }
      };
    });

    this.calendarOptions.events = events;
  }
}