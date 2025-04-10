import { Component } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'lib-first-lib',
  imports: [DashboardComponent],
  templateUrl: './first-lib.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `
})
export class FirstLibComponent {
  // rien pour l'instant
}