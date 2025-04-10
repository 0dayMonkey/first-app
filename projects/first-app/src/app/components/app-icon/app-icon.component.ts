import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-icon.component.html',
  styleUrls: ['./app-icon.component.scss']
})
export class AppIconComponent {
  @Input() name: string = '';
  @Input() iconUrl?: string;
  @Input() notificationCount?: number;
  
  // première lettre si pas d'icone
  get firstLetter(): string {
    return this.name.charAt(0).toUpperCase();
  }
}