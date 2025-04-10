import { Component, OnInit, ViewChild, ElementRef, HostListener, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { StorageService } from '../../services/storage.service';
import { Widget } from '../../models/widget.model';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { AddWidgetDialogComponent } from '../add-widget-dialog/add-widget-dialog.component';
import { RenameDialogComponent } from '../rename-dialog/rename-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDialogModule,
    AppIconComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  // trucs de base
  widgets: Widget[] = [];
  currentPage = 0;
  widgetsPerPage = 3;
  
  // pour slider
  touchStartX = 0;
  touchMoveX = 0;
  slideTranslation = 0;
  
  // menu quand click droit
  menuVisible = false;
  menuX = 0;
  menuY = 0;
  selectedWidget: Widget | null = null;
  
  // fullscreen
  isFullscreen = false;
  currentLandingUrl: SafeResourceUrl | null = null;
  
  // points style iphone
  get totalPagesArray(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i);
  }
  
  // calculs
  get totalPages(): number {
    return Math.ceil(this.widgets.length / this.widgetsPerPage);
  }
  
  get visibleWidgets(): Widget[] {
    const start = this.currentPage * this.widgetsPerPage;
    return this.widgets.slice(start, start + this.widgetsPerPage);
  }

  constructor(
    private sanitizer: DomSanitizer, 
    private dialog: MatDialog,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    // revcup du storage
    const savedWidgets = this.storageService.getWidgets();
    
    if (savedWidgets && savedWidgets.length > 0) {
      // on convertit
      this.widgets = savedWidgets.map(w => ({
        id: w.id,
        name: w.name,
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl(w.appUrlStr),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl(w.landingUrlStr),
        position: w.position,
        iconUrl: w.iconUrl
      }));
      
      // trier
      this.widgets.sort((a, b) => a.position - b.position);
    } else {
      // widgets par défaut
      this.widgets = [
        { 
          id: 1, 
          name: 'Google', 
          appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com'),
          landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/search?q=homepage'),
          position: 0,
          iconUrl: 'https://www.google.com/favicon.ico'
        },
        { 
          id: 2, 
          name: 'YouTube', 
          appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/dQw4w9WgXcQ'),
          landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com'),
          position: 1,
          iconUrl: 'https://www.youtube.com/favicon.ico'
        },
        { 
          id: 3, 
          name: 'Twitter', 
          appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://twitter.com/i/flow/login'),
          landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://twitter.com/explore'),
          position: 2,
          iconUrl: 'https://twitter.com/favicon.ico'
        },
        { 
          id: 4, 
          name: 'Facebook', 
          appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.facebook.com/login'),
          landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.facebook.com/watch'),
          position: 3,
          iconUrl: 'https://www.facebook.com/favicon.ico'
        },
        { 
          id: 5, 
          name: 'Reddit', 
          appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.reddit.com/r/popular/'),
          landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.reddit.com/new/'),
          position: 4,
          iconUrl: 'https://www.reddit.com/favicon.ico'
        },
        { 
          id: 6, 
          name: 'Instagram', 
          appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.instagram.com/explore/'),
          landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.instagram.com/direct/inbox/'),
          position: 5,
          iconUrl: 'https://www.instagram.com/favicon.ico'
        }
      ];
      
      // save
      this.saveWidgets();
    }
  }
  
  // si widget visible
  isWidgetVisible(index: number): boolean {
    const start = this.currentPage * this.widgetsPerPage;
    const end = start + this.widgetsPerPage - 1;
    return index >= start && index <= end;
  }
  
  // keyboard
  onKeyDown(event: KeyboardEvent): void {
    if (this.isFullscreen) {
      if (event.key === 'Escape') {
        this.closeFullscreen();
      }
      return;
    }
    
    if (event.key === 'ArrowLeft') {
      this.prevPage();
    } else if (event.key === 'ArrowRight') {
      this.nextPage();
    }
  }
  
  // touch events
  onTouchStart(event: TouchEvent): void {
    if (this.isFullscreen) return;
    
    this.touchStartX = event.touches[0].clientX;
  }
  
  onTouchMove(event: TouchEvent): void {
    if (this.isFullscreen) return;
    
    this.touchMoveX = event.touches[0].clientX;
    
    const x = this.touchMoveX - this.touchStartX;
    
    if ((this.currentPage === 0 && x > 0) || 
        (this.currentPage === this.totalPages - 1 && x < 0)) {
      this.slideTranslation = x * 0.2; // elastique
    } else {
      this.slideTranslation = x;
    }
  }
  
  onTouchEnd(): void {
    if (this.isFullscreen) return;
    
    const diff = this.touchMoveX - this.touchStartX;
    
    if (Math.abs(diff) > 100) { // assez swipe
      if (diff > 0 && this.currentPage > 0) {
        this.prevPage();
      } else if (diff < 0 && this.currentPage < this.totalPages - 1) {
        this.nextPage();
      }
    }
    
    this.slideTranslation = 0;
  }
  
  // pages
  prevPage(): void {
    if (this.isFullscreen) return;
    
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.isFullscreen) return;
    
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }
  
  // ouvre l'app
  openApp(widget: Widget): void {
    console.log('Ouverture de', widget.name);
    this.currentLandingUrl = widget.landingUrl;
    this.isFullscreen = true;
  }
  
  // ferme
  closeFullscreen(): void {
    this.isFullscreen = false;
    this.currentLandingUrl = null;
  }
  
  // menu
  showContextMenu(event: MouseEvent, widget: Widget): void {
    event.preventDefault();
    
    this.menuVisible = true;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    this.selectedWidget = widget;
    
    setTimeout(() => {
      document.addEventListener('click', this.hideContextMenu);
    }, 10);
  }
  
  hideContextMenu = () => {
    this.menuVisible = false;
    document.removeEventListener('click', this.hideContextMenu);
  }
  
  // edit dialog
  editWidget(widget: Widget): void {
    if (!widget) return;
    
    this.menuVisible = false;
    
    // je met juste le nom - on va faire un dialog pour rename
    const dialogRef = this.dialog.open(RenameDialogComponent, {
      width: '300px',
      data: { name: widget.name }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        widget.name = result;
        this.saveWidgets();
      }
    });
  }
  
  // delete app
  deleteWidget(widget: Widget): void {
    if (!widget) return;
    
    const index = this.widgets.findIndex(w => w.id === widget.id);
    if (index !== -1) {
      this.widgets.splice(index, 1);
      
      // on reclalcule positions
      this.widgets.forEach((w, i) => {
        w.position = i;
      });
      
      // va page precedente si vide
      if (this.visibleWidgets.length === 0 && this.currentPage > 0) {
        this.currentPage--;
      }
      
      this.saveWidgets();
    }
    
    this.hideContextMenu();
  }
  
  // save widgets
  saveWidgets(): void {
    this.storageService.saveWidgets(this.widgets);
  }
  
  // dialog pour add
  openAddWidgetDialog(): void {
    const dialogRef = this.dialog.open(AddWidgetDialogComponent, {
      width: '350px'
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addWidget(result.name, result.appUrl, result.landingUrl, result.iconUrl);
      }
    });
  }
  
  // add widget
  addWidget(name: string, appUrl: string, landingUrl: string, iconUrl: string): void {
    // genere id
    const newId = Math.max(0, ...this.widgets.map(w => w.id)) + 1;
    
    const newWidget: Widget = {
      id: newId,
      name: name,
      appUrl: this.sanitizer.bypassSecurityTrustResourceUrl(appUrl),
      landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl(landingUrl),
      position: this.widgets.length,
      iconUrl: iconUrl
    };
    
    this.widgets.push(newWidget);
    this.saveWidgets();
    
    // go derniere page
    this.currentPage = Math.floor((this.widgets.length - 1) / this.widgetsPerPage);
  }
}