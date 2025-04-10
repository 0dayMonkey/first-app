import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragPlaceholder, CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';

import { StorageService } from '../../services/storage.service';
import { NotificationService } from '../../services/notification.service';
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
    MatInputModule,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    CdkDragPlaceholder
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  // trucs de base
  widgets: Widget[] = [];
  currentPage = 0;
  widgetsPerPage = 5; // 5 apps par page comme demandé
  
  // pour slider
  touchStartX = 0;
  touchMoveX = 0;
  slideTranslation = 0;
  containerWidth = 0;
  isAnimating = false;
  isDragging = false;
  
  // mode édition
  editMode = false;
  draggingWidgetId: number | null = null;
  longPressTimeout: any = null;
  
  // menu quand click droit
  menuVisible = false;
  menuX = 0;
  menuY = 0;
  selectedWidget: Widget | null = null;
  
  // fullscreen
  isFullscreen = false;
  currentLandingUrl: SafeResourceUrl | null = null;
  
  // subscriptions aux notifications
  private notificationSubscriptions: { [widgetId: number]: Subscription } = {};
  
  // points style iphone
  get totalPagesArray(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i);
  }
  
  // calculs
  get totalPages(): number {
    return Math.ceil(this.widgets.length / this.widgetsPerPage);
  }
  
  constructor(
    private sanitizer: DomSanitizer, 
    private dialog: MatDialog,
    private storageService: StorageService,
    private notificationService: NotificationService
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
        }
      ];
      
      // save
      this.saveWidgets();
    }
    
    // mise à jour de la largeur du conteneur
    this.updateContainerWidth();
    window.addEventListener('resize', this.updateContainerWidth.bind(this));
    
    // démarrer les notifications pour tous les widgets
    this.startNotifications();
  }
  
  ngOnDestroy(): void {
    // nettoyage des subscriptions
    Object.values(this.notificationSubscriptions).forEach(sub => sub.unsubscribe());
    window.removeEventListener('resize', this.updateContainerWidth.bind(this));
    this.clearLongPressTimeout();
  }
  
  private updateContainerWidth(): void {
    this.containerWidth = window.innerWidth;
  }
  
  // Obtenir une page spécifique de widgets
  getWidgetsForPage(pageIndex: number): Widget[] {
    const start = pageIndex * this.widgetsPerPage;
    const end = Math.min(start + this.widgetsPerPage, this.widgets.length);
    return this.widgets.slice(start, end);
  }
  
  // Obtenir les IDs des listes connectées pour le drag & drop
  getConnectedListIds(): string[] {
    return this.totalPagesArray.map(index => `page-${index}`);
  }
  
  // Gestion du drop pour drag & drop
  onDrop(event: CdkDragDrop<Widget[]>, pageIndex: number): void {
    if (!this.editMode) return;
    
    const widgetData = event.item.data as Widget;
    
    if (event.previousContainer === event.container) {
      // Déplacement dans la même page
      moveItemInArray(this.widgets, 
                      this.getWidgetIndexInAllWidgets(widgetData.id), 
                      pageIndex * this.widgetsPerPage + event.currentIndex);
    } else {
      // Déplacement vers une autre page
      const previousIndex = this.getWidgetIndexInAllWidgets(widgetData.id);
      const targetIndex = pageIndex * this.widgetsPerPage + event.currentIndex;
      
      // Déplacer dans le tableau global
      this.widgets.splice(targetIndex, 0, this.widgets.splice(previousIndex, 1)[0]);
    }
    
    // Mettre à jour les positions
    this.updateWidgetPositions();
    this.saveWidgets();
  }
  
  // Obtenir l'index global d'un widget à partir de son ID
  private getWidgetIndexInAllWidgets(widgetId: number): number {
    return this.widgets.findIndex(w => w.id === widgetId);
  }
  
  // Mettre à jour les positions de tous les widgets
  private updateWidgetPositions(): void {
    this.widgets.forEach((widget, index) => {
      widget.position = index;
    });
  }
  
  // Obtenir la valeur de transformation pour l'animation
  getTranslationValue(): number {
    // Valeur de base pour la page actuelle
    const baseTranslation = -this.currentPage * this.containerWidth;
    
    // Si on est en train de faire glisser, ajouter le décalage du mouvement
    if (this.isDragging) {
      return baseTranslation + this.slideTranslation;
    }
    
    return baseTranslation;
  }
  
  // démarre les notifications pour tous les widgets
  private startNotifications(): void {
    // récupérer les IDs de tous les widgets
    const widgetIds = this.widgets.map(widget => widget.id);
    
    // démarrer les mises à jour de notifications
    this.notificationService.startNotificationUpdates(widgetIds);
    
    // souscrire aux notifications pour chaque widget
    widgetIds.forEach(id => {
      this.subscribeToWidgetNotifications(id);
    });
  }
  
  // souscrit aux notifications pour un widget spécifique
  private subscribeToWidgetNotifications(widgetId: number): void {
    // nettoyer l'ancienne souscription si elle existe
    if (this.notificationSubscriptions[widgetId]) {
      this.notificationSubscriptions[widgetId].unsubscribe();
    }
    
    // souscrire aux mises à jour de notifications
    this.notificationSubscriptions[widgetId] = this.notificationService
      .getNotificationsForWidget(widgetId)
      .subscribe(count => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (widget) {
          widget.notificationCount = count;
        }
      });
  }
  
  // Gestion de l'appui prolongé (mousedown)
  onWidgetMouseDown(event: MouseEvent, widget: Widget): void {
    if (this.editMode) return; // Déjà en mode édition
    
    this.clearLongPressTimeout();
    
    // Démarrer un timer pour l'appui prolongé (3 secondes)
    this.longPressTimeout = setTimeout(() => {
      this.startEditMode();
      this.draggingWidgetId = widget.id;
    }, 3000);
    
    // Annuler le timer si la souris est relâchée
    const mouseUpHandler = () => {
      this.clearLongPressTimeout();
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    
    document.addEventListener('mouseup', mouseUpHandler);
  }
  
  // Gestion de l'appui prolongé (touchstart)
  onWidgetTouchStart(event: TouchEvent, widget: Widget): void {
    if (this.editMode) return; // Déjà en mode édition
    
    this.clearLongPressTimeout();
    
    // Démarrer un timer pour l'appui prolongé (3 secondes)
    this.longPressTimeout = setTimeout(() => {
      this.startEditMode();
      this.draggingWidgetId = widget.id;
    }, 3000);
    
    // Annuler le timer si le toucher est relâché
    const touchEndHandler = () => {
      this.clearLongPressTimeout();
      document.removeEventListener('touchend', touchEndHandler);
    };
    
    document.addEventListener('touchend', touchEndHandler);
  }
  
  // Nettoyer le timeout d'appui prolongé
  private clearLongPressTimeout(): void {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  }
  
  // Démarrer le mode édition
  startEditMode(): void {
    this.editMode = true;
    this.hideContextMenu();
  }
  
  // Quitter le mode édition
  exitEditMode(): void {
    this.editMode = false;
    this.draggingWidgetId = null;
  }
  
  // keyboard
  onKeyDown(event: KeyboardEvent): void {
    if (this.isFullscreen) {
      if (event.key === 'Escape') {
        this.closeFullscreen();
      }
      return;
    }
    
    if (this.editMode) {
      if (event.key === 'Escape') {
        this.exitEditMode();
      }
      return;
    }
    
    if (event.key === 'ArrowLeft') {
      this.prevPage();
    } else if (event.key === 'ArrowRight') {
      this.nextPage();
    }
  }
  
  // Aller directement à une page spécifique
  goToPage(pageIndex: number): void {
    if (this.isFullscreen || this.isAnimating || pageIndex === this.currentPage) return;
    
    this.isAnimating = true;
    this.currentPage = pageIndex;
    this.slideTranslation = 0;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 300); // durée de l'animation
  }
  
  // Support pour la molette de la souris
  onMouseWheel(event: WheelEvent): void {
    if (this.isFullscreen || this.isAnimating || this.editMode) return;
    
    // Pour éviter trop de sensibilité
    if (Math.abs(event.deltaX) > 30) {
      if (event.deltaX > 0) {
        this.nextPage();
      } else {
        this.prevPage();
      }
    }
  }
  
  // touch events
  onTouchStart(event: TouchEvent): void {
    if (this.isFullscreen || this.isAnimating || this.editMode) return;
    
    this.touchStartX = event.touches[0].clientX;
    this.isDragging = true;
    this.slideTranslation = 0;
  }
  
  onTouchMove(event: TouchEvent): void {
    if (this.isFullscreen || !this.isDragging) return;
    
    this.touchMoveX = event.touches[0].clientX;
    const diff = this.touchMoveX - this.touchStartX;
    
    // Limiter le déplacement aux extrémités
    if ((this.currentPage === 0 && diff > 0) || 
        (this.currentPage === this.totalPages - 1 && diff < 0)) {
      this.slideTranslation = diff * 0.2; // effet élastique
    } else {
      this.slideTranslation = diff;
    }
  }
  
  onTouchEnd(): void {
    if (this.isFullscreen || !this.isDragging) return;
    
    this.isDragging = false;
    const diff = this.slideTranslation;
    
    if (Math.abs(diff) > this.containerWidth * 0.15) { // assez swipe (15% de l'écran)
      if (diff > 0 && this.currentPage > 0) {
        this.prevPage();
      } else if (diff < 0 && this.currentPage < this.totalPages - 1) {
        this.nextPage();
      } else {
        // Revenir à la position d'origine avec animation
        this.snapBackToCurrentPage();
      }
    } else {
      // Pas assez déplacé, retour à la position actuelle
      this.snapBackToCurrentPage();
    }
  }
  
  // Animation pour revenir à la page actuelle
  private snapBackToCurrentPage(): void {
    this.isAnimating = true;
    this.slideTranslation = 0;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 300); // durée de l'animation
  }
  
  // pages
  prevPage(): void {
    if (this.isFullscreen || this.isAnimating || this.currentPage <= 0) return;
    
    this.isAnimating = true;
    this.currentPage--;
    this.slideTranslation = 0;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 300); // durée de l'animation
  }

  nextPage(): void {
    if (this.isFullscreen || this.isAnimating || this.currentPage >= this.totalPages - 1) return;
    
    this.isAnimating = true;
    this.currentPage++;
    this.slideTranslation = 0;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 300); // durée de l'animation
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
      // supprimer la souscription aux notifications
      if (this.notificationSubscriptions[widget.id]) {
        this.notificationSubscriptions[widget.id].unsubscribe();
        delete this.notificationSubscriptions[widget.id];
      }
      
      // supprimer les notifications du service
      this.notificationService.removeWidgetNotification(widget.id);
      
      // supprimer le widget
      this.widgets.splice(index, 1);
      
      // on reclalcule positions
      this.widgets.forEach((w, i) => {
        w.position = i;
      });
      
      // va page precedente si vide
      if (this.getWidgetsForPage(this.currentPage).length === 0 && this.currentPage > 0) {
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
    
    // ajouter aux notifications
    this.notificationService.addWidgetNotification(newId);
    this.subscribeToWidgetNotifications(newId);
    
    this.saveWidgets();
    
    // go derniere page
    this.currentPage = Math.floor((this.widgets.length - 1) / this.widgetsPerPage);
  }
}