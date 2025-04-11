import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { App } from '../models/app.model';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-icon.component.html',
  styleUrls: ['./app-icon.component.scss']
})
export class AppIconComponent {
  @Input() app!: App;
  @Input() editMode = false;
  @Output() delete = new EventEmitter<void>();
  
  defaultIconUrl = 'assets/icons/default-app-icon.png';
  safeIconUrl: SafeResourceUrl | null = null;
  
  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnChanges(): void {
    // Si une URL d'icône est fournie, on la sécurise
    if (this.app && this.app.iconUrl) {
      this.safeIconUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.app.iconUrl);
    } else {
      this.safeIconUrl = null;
    }
  }
  
  /**
   * Gère l'événement de suppression d'une application
   * @param event Événement de clic
   */
  onDeleteClick(event: Event): void {
    event.stopPropagation(); // Empêche la propagation du clic
    this.delete.emit();
  }
  
  /**
   * Gère les erreurs de chargement d'image
   */
  onImageError(): void {
    this.safeIconUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.defaultIconUrl);
  }
}