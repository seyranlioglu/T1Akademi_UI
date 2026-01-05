import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private timeLeft: number = 0; 
  private timerSubscription!: Subscription;
  private timeLeftSubject = new BehaviorSubject<number>(0);

  remainingTime$ = this.timeLeftSubject.asObservable();

 
  startCountdown(durationInSeconds: number): void {
    this.timeLeft = durationInSeconds;
    this.timeLeftSubject.next(this.timeLeft);


    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.timeLeftSubject.next(this.timeLeft); 
      } else {
        this.timerSubscription.unsubscribe();
      }
    });
  }

  stopCountdown(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
