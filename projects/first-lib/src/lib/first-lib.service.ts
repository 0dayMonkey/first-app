import { Component } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-first-lib',
  standalone: true,
  imports: [CommonModule, DashboardComponent],
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