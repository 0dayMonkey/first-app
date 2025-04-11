import { Component, OnInit, OnDestroy, HostListener, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Observable, Subscription } from 'rxjs';

import { AddWidgetDialogComponent } from '../add-widget-dialog/add-widget-dialog.component';
import { EditAppDialogComponent } from '../edit-app-dialog/edit-app-dialog.component';
import { AppIconComponent } from '../app-icon/app-icon.component';
import { StorageService } from '../services/storage.service';
import { NotificationService } from '../services/notification.service';
import { AppDataService } from '../services/app-data.service';
import { HeaderComponent } from '../header/header.component';
import { App } from '../models/app.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    DragDropModule,
    AppIconComponent,
    HeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  pages: App[][] = [[]];
  currentPage = 0;
  editMode = false;
  
  showContextMenu = false;
  contextMenuPosition = { x: 0, y: 0 };
  selectedApp: App | null = null;
  selectedAppIndices: { pageIndex: number, appIndex: number } = { pageIndex: 0, appIndex: 0 };
  
  private notificationSubscription: Subscription | null = null;
  private readonly PAGE_SIZE = 5;
  
  constructor(
    private dialog: MatDialog,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private appDataService: AppDataService,
    private zone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApps();
    
    this.notificationSubscription = this.notificationService.getNotifications().subscribe((notifications: { [key: string]: number }) => {
      if (!this.editMode) {
        this.updateNotificationBadges(notifications);
      }
    });
    
    this.initSwipeDetection();
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  loadApps(): void {
    const apps = this.storageService.getApps();
    if (apps.length === 0) {
      this.initializeDefaultApps();
    } else {
      this.organizeAppsIntoPages(apps);
    }
  }

  organizeAppsIntoPages(apps: App[]): void {
    this.pages = [];
    let currentPage: App[] = [];
    
    // Assurer que l'application Mypromo est en première position
    const mypromoApp = apps.find(app => app.id === 'mypromo-app-id');
    const otherApps = apps.filter(app => app.id !== 'mypromo-app-id');
    
    if (mypromoApp) {
      currentPage.push(mypromoApp);
    }
    
    otherApps.forEach(app => {
      if (currentPage.length >= this.PAGE_SIZE) {
        this.pages.push(currentPage);
        currentPage = [];
      }
      currentPage.push(app);
    });
    
    if (currentPage.length > 0) {
      this.pages.push(currentPage);
    }
    
    if (this.pages.length === 0) {
      this.pages.push([]);
    }
  }

  initializeDefaultApps(): void {
    this.appDataService.getDefaultApps().subscribe(defaultApps => {
      if (defaultApps.length > 0) {
        this.storageService.saveApps(defaultApps);
        this.organizeAppsIntoPages(defaultApps);
      } else {
        const fallbackApps: App[] = [
          {
            id: '1',
            name: 'Google',
            url: 'https://www.google.com',
            iconUrl: 'https://www.google.com/favicon.ico',
            notifications: 0
          },
          {
            id: '2',
            name: 'YouTube',
            url: 'https://www.youtube.com',
            iconUrl: 'https://www.youtube.com/favicon.ico',
            notifications: 0
          }
        ];
        
        this.storageService.saveApps(fallbackApps);
        this.organizeAppsIntoPages(fallbackApps);
      }
    });
  }

  resetAppStorage(): void {
    this.storageService.clearApps();
    this.initializeDefaultApps();
  }

  updateNotificationBadges(notifications: { [key: string]: number }): void {
    // S'assurer que les notifications sont appliquées à toutes les pages
    this.pages.forEach(page => {
      page.forEach(app => {
        if (app.id && notifications[app.id] !== undefined) {
          app.notifications = notifications[app.id];
        }
      });
    });
  }

  initSwipeDetection(): void {
    let touchStartX = 0;
    const container = document.querySelector('.dashboard-container');
    
    if (container) {
      container.addEventListener('touchstart', (e: any) => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      
      container.addEventListener('touchend', (e: any) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
          this.zone.run(() => {
            if (diff > 0 && this.currentPage < this.pages.length - 1) {
              this.goToPage(this.currentPage + 1);
            } else if (diff < 0 && this.currentPage > 0) {
              this.goToPage(this.currentPage - 1);
            }
          });
        }
      }, { passive: true });
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.editMode) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        if (this.currentPage > 0) {
          this.goToPage(this.currentPage - 1);
        }
        break;
      case 'ArrowRight':
        if (this.currentPage < this.pages.length - 1) {
          this.goToPage(this.currentPage + 1);
        }
        break;
    }
  }

  @HostListener('wheel', ['$event'])
  handleWheel(event: WheelEvent): void {
    if (this.editMode) return;
    
    if (event.deltaX > 50 && this.currentPage < this.pages.length - 1) {
      this.goToPage(this.currentPage + 1);
    } else if (event.deltaX < -50 && this.currentPage > 0) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.pages.length) {
      this.currentPage = pageIndex;
    }
  }

  openApp(app: App): void {
    // Vérifier si c'est une application locale (commence par /)
    if (app.url && app.url.startsWith('/')) {
      // Application locale, naviguer directement
      this.router.navigateByUrl(app.url);
    } else {
      // Application externe, utiliser la page d'atterrissage
      this.router.navigate(['/landingPage'], { 
        queryParams: { 
          url: app.url,
          name: app.name
        }
      });
    }
  }

  showAppContextMenu(event: MouseEvent, app: App, pageIndex: number, appIndex: number): void {
    event.preventDefault();
    this.selectedApp = app;
    this.selectedAppIndices = { pageIndex, appIndex };
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.showContextMenu = true;
    
    setTimeout(() => {
      document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
    });
  }

  hideContextMenu(): void {
    this.showContextMenu = false;
  }

  editApp(): void {
    this.hideContextMenu();
    
    if (!this.selectedApp) return;
    
    const dialogRef = this.dialog.open(EditAppDialogComponent, {
      data: { app: this.selectedApp },
      width: '400px'
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const pageIndex = this.selectedAppIndices.pageIndex;
        const appIndex = this.selectedAppIndices.appIndex;
        
        this.pages[pageIndex][appIndex] = result;
        
        this.saveApps();
      }
    });
  }

  deleteApp(): void {
    this.hideContextMenu();
    
    if (!this.selectedApp) return;
    
    const pageIndex = this.selectedAppIndices.pageIndex;
    const appIndex = this.selectedAppIndices.appIndex;
    
    this.pages[pageIndex].splice(appIndex, 1);
    
    if (this.pages[pageIndex].length === 0 && this.pages.length > 1) {
      this.pages.splice(pageIndex, 1);
      if (this.currentPage >= this.pages.length) {
        this.currentPage = this.pages.length - 1;
      }
    }
    
    this.saveApps();
  }

  deleteAppInEditMode(pageIndex: number, appIndex: number): void {
    this.pages[pageIndex].splice(appIndex, 1);
    
    if (this.pages[pageIndex].length === 0 && this.pages.length > 1) {
      this.pages.splice(pageIndex, 1);
      if (this.currentPage >= this.pages.length) {
        this.currentPage = this.pages.length - 1;
      }
    }
    
    this.saveApps();
  }

  enterEditMode(): void {
    this.hideContextMenu();
    this.editMode = true;
  }

  exitEditMode(): void {
    this.editMode = false;
    this.saveApps();
  }

  openAddAppDialog(pageIndex: number): void {
    if (this.pages[pageIndex].length >= this.PAGE_SIZE) {
      const dialogRef = this.dialog.open(AddWidgetDialogComponent, {
        width: '400px'
      });
      
      dialogRef.afterClosed().subscribe((app: App | undefined) => {
        if (app) {
          app.id = Date.now().toString();
          app.notifications = 0;
          
          let targetPageIndex = pageIndex;
          
          // Cherche une page qui a de l'espace
          for (let i = 0; i < this.pages.length; i++) {
            if (this.pages[i].length < this.PAGE_SIZE) {
              targetPageIndex = i;
              break;
            }
          }
          
          // Si aucune page n'a d'espace, crée une nouvelle page
          if (this.pages[targetPageIndex].length >= this.PAGE_SIZE) {
            this.pages.push([]);
            targetPageIndex = this.pages.length - 1;
          }
          
          this.pages[targetPageIndex].push(app);
          this.goToPage(targetPageIndex);
          
          this.saveApps();
        }
      });
    } else {
      const dialogRef = this.dialog.open(AddWidgetDialogComponent, {
        width: '400px'
      });
      
      dialogRef.afterClosed().subscribe((app: App | undefined) => {
        if (app) {
          app.id = Date.now().toString();
          app.notifications = 0;
          
          this.pages[pageIndex].push(app);
          
          this.saveApps();
        }
      });
    }
  }

  drop(event: CdkDragDrop<App[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      if (event.container.data.length < this.PAGE_SIZE) {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      }
    }
    
    this.saveApps();
  }

  getConnectedListIds(): string[] {
    return this.pages.map((_, i) => `page-${i}`);
  }

  saveApps(): void {
    const allApps: App[] = [];
    this.pages.forEach(page => {
      page.forEach(app => {
        allApps.push(app);
      });
    });
    
    this.storageService.saveApps(allApps);
  }
}