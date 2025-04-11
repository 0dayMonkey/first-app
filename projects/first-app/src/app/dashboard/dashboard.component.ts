import { Component, OnInit, OnDestroy, HostListener, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';

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
  pages: App[][] = [[]]; // Tableaux multidimensionnels pour les pages d'applications
  currentPage = 0; // Page actuelle
  editMode = false; // Mode d'édition
  
  // Variables pour le menu contextuel
  showContextMenu = false;
  contextMenuPosition = { x: 0, y: 0 };
  selectedApp: App | null = null;
  selectedAppIndices: { pageIndex: number, appIndex: number } = { pageIndex: 0, appIndex: 0 };
  
  private notificationSubscription: Subscription | null = null;
  private readonly PAGE_SIZE = 20; // Nombre maximal d'applications par page
  
  constructor(
    private dialog: MatDialog,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private appDataService: AppDataService,
    private zone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Charger les applications depuis le service de stockage
    this.loadApps();
    
    // S'abonner aux mises à jour de notifications
    this.notificationSubscription = this.notificationService.getNotifications().subscribe((notifications: { [key: string]: number }) => {
      if (!this.editMode) {
        // Mettre à jour les badges de notification pour chaque application
        this.updateNotificationBadges(notifications);
      }
    });
    
    // Initialiser le système de balayage tactile
    this.initSwipeDetection();
  }

  ngOnDestroy(): void {
    // Nettoyer les abonnements pour éviter les fuites de mémoire
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  /**
   * Charger les applications depuis le service de stockage
   */
  loadApps(): void {
    const apps = this.storageService.getApps();
    if (apps.length === 0) {
      // Initialiser avec des applications par défaut si aucune n'est trouvée
      this.initializeDefaultApps();
    } else {
      this.organizeAppsIntoPages(apps);
    }
  }

  /**
   * Organiser les applications en pages
   * @param apps Liste complète des applications
   */
  organizeAppsIntoPages(apps: App[]): void {
    this.pages = [];
    let currentPage: App[] = [];
    
    apps.forEach(app => {
      if (currentPage.length >= this.PAGE_SIZE) {
        this.pages.push(currentPage);
        currentPage = [];
      }
      currentPage.push(app);
    });
    
    if (currentPage.length > 0) {
      this.pages.push(currentPage);
    }
    
    // S'assurer qu'il y a au moins une page
    if (this.pages.length === 0) {
      this.pages.push([]);
    }
  }

  /**
   * Initialiser avec des applications par défaut depuis le fichier JSON
   */
  initializeDefaultApps(): void {
    this.appDataService.getDefaultApps().subscribe(defaultApps => {
      if (defaultApps.length > 0) {
        this.storageService.saveApps(defaultApps);
        this.organizeAppsIntoPages(defaultApps);
      } else {
        // Fallback si le fichier JSON n'est pas disponible
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

  /**
   * Mettre à jour les badges de notification
   * @param notifications Objet contenant les notifications pour chaque application
   */
  updateNotificationBadges(notifications: { [key: string]: number }): void {
    this.pages.forEach(page => {
      page.forEach(app => {
        if (app.id && notifications[app.id] !== undefined) {
          app.notifications = notifications[app.id];
        }
      });
    });
  }

  /**
   * Initialiser la détection de balayage tactile pour la navigation
   */
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
        
        if (Math.abs(diff) > 50) { // Seuil de détection du balayage
          this.zone.run(() => {
            if (diff > 0 && this.currentPage < this.pages.length - 1) {
              // Balayage vers la gauche (page suivante)
              this.goToPage(this.currentPage + 1);
            } else if (diff < 0 && this.currentPage > 0) {
              // Balayage vers la droite (page précédente)
              this.goToPage(this.currentPage - 1);
            }
          });
        }
      }, { passive: true });
    }
  }

  /**
   * Gestionnaire d'événements pour les touches du clavier
   * @param event Événement clavier
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.editMode) return; // Ignorer en mode édition
    
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

  /**
   * Gestionnaire d'événements pour la molette de la souris
   * @param event Événement de la molette
   */
  @HostListener('wheel', ['$event'])
  handleWheel(event: WheelEvent): void {
    if (this.editMode) return; // Ignorer en mode édition
    
    if (event.deltaX > 50 && this.currentPage < this.pages.length - 1) {
      // Défilement vers la droite (page suivante)
      this.goToPage(this.currentPage + 1);
    } else if (event.deltaX < -50 && this.currentPage > 0) {
      // Défilement vers la gauche (page précédente)
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * Naviguer vers une page spécifique
   * @param pageIndex Index de la page cible
   */
  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.pages.length) {
      this.currentPage = pageIndex;
    }
  }

  /**
   * Ouvrir une application
   * @param app L'application à ouvrir
   */
  openApp(app: App): void {
    // Naviguer vers la page d'atterrissage avec les paramètres de l'application
    this.router.navigate(['/landingPage'], { 
      queryParams: { 
        url: app.url,
        name: app.name
      }
    });
  }

  /**
   * Afficher le menu contextuel pour une application
   * @param event Événement de clic droit
   * @param app L'application sélectionnée
   * @param pageIndex Index de la page
   * @param appIndex Index de l'application dans la page
   */
  showAppContextMenu(event: MouseEvent, app: App, pageIndex: number, appIndex: number): void {
    event.preventDefault();
    this.selectedApp = app;
    this.selectedAppIndices = { pageIndex, appIndex };
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.showContextMenu = true;
    
    // Masquer le menu contextuel lors d'un clic n'importe où
    setTimeout(() => {
      document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
    });
  }

  /**
   * Masquer le menu contextuel
   */
  hideContextMenu(): void {
    this.showContextMenu = false;
  }

  /**
   * Modifier une application
   */
  editApp(): void {
    this.hideContextMenu();
    
    if (!this.selectedApp) return;
    
    const dialogRef = this.dialog.open(EditAppDialogComponent, {
      data: { app: this.selectedApp },
      width: '400px'
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Mettre à jour l'application avec les nouvelles valeurs
        const pageIndex = this.selectedAppIndices.pageIndex;
        const appIndex = this.selectedAppIndices.appIndex;
        
        this.pages[pageIndex][appIndex] = result;
        
        // Sauvegarder les modifications
        this.saveApps();
      }
    });
  }

  /**
   * Supprimer une application
   */
  deleteApp(): void {
    this.hideContextMenu();
    
    if (!this.selectedApp) return;
    
    const pageIndex = this.selectedAppIndices.pageIndex;
    const appIndex = this.selectedAppIndices.appIndex;
    
    this.pages[pageIndex].splice(appIndex, 1);
    
    // Supprimer la page si elle est vide et ce n'est pas la dernière page
    if (this.pages[pageIndex].length === 0 && this.pages.length > 1) {
      this.pages.splice(pageIndex, 1);
      if (this.currentPage >= this.pages.length) {
        this.currentPage = this.pages.length - 1;
      }
    }
    
    // Sauvegarder les modifications
    this.saveApps();
  }

  /**
   * Supprimer une application en mode édition
   * @param pageIndex Index de la page
   * @param appIndex Index de l'application
   */
  deleteAppInEditMode(pageIndex: number, appIndex: number): void {
    this.pages[pageIndex].splice(appIndex, 1);
    
    // Supprimer la page si elle est vide et ce n'est pas la dernière page
    if (this.pages[pageIndex].length === 0 && this.pages.length > 1) {
      this.pages.splice(pageIndex, 1);
      if (this.currentPage >= this.pages.length) {
        this.currentPage = this.pages.length - 1;
      }
    }
    
    // Sauvegarder les modifications
    this.saveApps();
  }

  /**
   * Entrer en mode édition
   */
  enterEditMode(): void {
    this.hideContextMenu();
    this.editMode = true;
  }

  /**
   * Sortir du mode édition
   */
  exitEditMode(): void {
    this.editMode = false;
    this.saveApps();
  }

  /**
   * Ouvrir le dialogue d'ajout d'application
   * @param pageIndex Index de la page cible
   */
  openAddAppDialog(pageIndex: number): void {
    const dialogRef = this.dialog.open(AddWidgetDialogComponent, {
      width: '400px'
    });
    
    dialogRef.afterClosed().subscribe((app: App | undefined) => {
      if (app) {
        // Générer un ID unique pour la nouvelle application
        app.id = Date.now().toString();
        app.notifications = 0;
        
        // Ajouter l'application à la page spécifiée
        this.pages[pageIndex].push(app);
        
        // Sauvegarder les modifications
        this.saveApps();
      }
    });
  }

  /**
   * Gestionnaire d'événements pour le glisser-déposer
   * @param event Événement de drop
   */
  drop(event: CdkDragDrop<App[]>): void {
    if (event.previousContainer === event.container) {
      // Déplacement dans la même page
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Déplacement entre pages différentes
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    
    // Sauvegarder les modifications
    this.saveApps();
  }

  /**
   * Obtenir les IDs des listes connectées pour le drag and drop
   */
  getConnectedListIds(): string[] {
    return this.pages.map((_, i) => `page-${i}`);
  }

  /**
   * Sauvegarder toutes les applications
   */
  saveApps(): void {
    // Aplatir le tableau multidimensionnel pour obtenir une liste unique
    const allApps: App[] = [];
    this.pages.forEach(page => {
      page.forEach(app => {
        allApps.push(app);
      });
    });
    
    // Sauvegarder dans le service de stockage
    this.storageService.saveApps(allApps);
  }
}