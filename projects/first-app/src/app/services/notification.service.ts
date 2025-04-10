import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

export interface NotificationState {
  [widgetId: number]: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsState = new BehaviorSubject<NotificationState>({});
  
  constructor() {
  }
  
  startNotificationUpdates(widgetIds: number[]): void {
    const initialState: NotificationState = {};
    widgetIds.forEach(id => {
      initialState[id] = this.getRandomNotificationCount();
    });
    
    this.notificationsState.next(initialState);
    
    interval(5000).subscribe(() => {
      const currentState = {...this.notificationsState.value};
      
      widgetIds.forEach(id => {
        currentState[id] = this.getRandomNotificationCount();
      });
      
      this.notificationsState.next(currentState);
    });
  }
  
  getNotificationsForWidget(widgetId: number): Observable<number> {
    return this.notificationsState.pipe(
      map(state => state[widgetId] || 0)
    );
  }
  
  addWidgetNotification(widgetId: number): void {
    const currentState = {...this.notificationsState.value};
    currentState[widgetId] = this.getRandomNotificationCount();
    this.notificationsState.next(currentState);
  }
  
  removeWidgetNotification(widgetId: number): void {
    const currentState = {...this.notificationsState.value};
    if (currentState[widgetId] !== undefined) {
      delete currentState[widgetId];
      this.notificationsState.next(currentState);
    }
  }
  
  private getRandomNotificationCount(): number {
    const random = Math.random();
    if (random < 0.3) {
      return 0; 
    } else {
      return Math.floor(Math.random() * 9) + 1;
    }
  }
}