import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Widget } from '../models/widget.model';

@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  private widgets: Widget[] = [
    {
      id: 'widget1',
      title: 'Application 1',
      icon: 'assets/icons/app1.svg',
      iframeUrl: 'https://example.com/app1',
      description: 'Description de l''application 1',
      backgroundColor: '#f0f4f8',
      isLoaded: false,
      hasError: false
    },
    {
      id: 'widget2',
      title: 'Application 2',
      icon: 'assets/icons/app2.svg',
      iframeUrl: 'https://example.com/app2',
      description: 'Description de l''application 2',
      backgroundColor: '#e6f7ff',
      isLoaded: false,
      hasError: false
    },
    {
      id: 'widget3',
      title: 'Application 3',
      icon: 'assets/icons/app3.svg',
      iframeUrl: 'https://example.com/app3',
      description: 'Description de l''application 3',
      backgroundColor: '#f0f9eb',
      isLoaded: false,
      hasError: false
    },
  ];

  private widgetsSubject = new BehaviorSubject<Widget[]>(this.widgets);

  constructor() { }

  getWidgets(): Observable<Widget[]> {
    return this.widgetsSubject.asObservable();
  }

  updateWidgetStatus(id: string, isLoaded: boolean, hasError: boolean = false): void {
    this.widgets = this.widgets.map(widget => {
      if (widget.id === id) {
        return { ...widget, isLoaded, hasError };
      }
      return widget;
    });
    this.widgetsSubject.next(this.widgets);
  }

  navigateToApp(id: string): void {
    console.log(`Navigation future vers l'application: ${id}`);
  }
}
