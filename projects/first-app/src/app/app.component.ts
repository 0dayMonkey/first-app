import { Component } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent],
  template: `<app-dashboard></app-dashboard>`,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `
})
export class AppComponent {
  title = 'first-app';
}