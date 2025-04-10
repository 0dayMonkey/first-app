import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Widget {
  id: number; 
  name: string;
  appUrl: SafeResourceUrl; // iframe petite
  landingUrl: SafeResourceUrl; // iframe quand on ouvre
  position?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  
  @ViewChild('renameInput') renameInput?: ElementRef;
  
  // les trucs de base
  widgets: Widget[] = [];
  currentPage = 0;
  widgetsPerPage = 12; // 4x3 grid style iphone
  
  // pour avoir les points page style iphone
  get totalPagesArray(): number[] {
    // crée un array avec des indices de page [0,1,2,etc]
    return Array.from({length: this.totalPages}, (_, i) => i);
  }
  
  // pour le drag
  dragStartX = 0;
  dragStartY = 0;
  dragStartIndex = -1;
  dragCurrentIndex = -1;
  
  // pour slider
  touchStartX = 0;
  touchMoveX = 0;
  slideTranslation = 0;
  
  // menu qd on clique droit
  menuVisible = false;
  menuX = 0;
  menuY = 0;
  selectedWidget: Widget | null = null;
  
  // rename
  renamingWidget: Widget | null = null;
  
  // mode edit
  isInEditMode = false;
  editingWidgets: {[key: number]: boolean} = {}; // tous les widgets sont en edit mode maintenant
  
  // mode fullscreen
  isFullscreen = false;
  currentLandingUrl: SafeResourceUrl | null = null;

  // animations
  widgetsMoving: {[key: number]: boolean} = {};
  
  // calcul pages
  get totalPages(): number {
    return Math.ceil(this.widgets.length / this.widgetsPerPage);
  }
  
  // widget visibles
  get visibleWidgets(): Widget[] {
    const start = this.currentPage * this.widgetsPerPage;
    return this.widgets.slice(start, start + this.widgetsPerPage);
  }

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    // des widgets tests
    this.widgets = [
      { 
        id: 1, 
        name: 'Google', 
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com'),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/search?q=homepage'),
        position: 0
      },
      { 
        id: 2, 
        name: 'YouTube', 
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/dQw4w9WgXcQ'),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com'),
        position: 1
      },
      { 
        id: 3, 
        name: 'Twitter', 
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://twitter.com/i/flow/login'),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://twitter.com/explore'),
        position: 2
      },
      { 
        id: 4, 
        name: 'Facebook', 
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.facebook.com/login'),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.facebook.com/watch'),
        position: 3
      },
      { 
        id: 5, 
        name: 'Reddit', 
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.reddit.com/r/popular/'),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.reddit.com/new/'),
        position: 4
      },
      { 
        id: 6, 
        name: 'Instagram', 
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.instagram.com/explore/'),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.instagram.com/direct/inbox/'),
        position: 5
      },
      { 
        id: 7, 
        name: 'LinkedIn', 
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.linkedin.com/feed/'),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.linkedin.com/jobs/'),
        position: 6
      },
      { 
        id: 8, 
        name: 'Github', 
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://github.com/trending'),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://github.com/explore'),
        position: 7
      },
      { 
        id: 9, 
        name: 'Amazon', 
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.amazon.com'),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.amazon.com/deals'),
        position: 8
      },
      { 
        id: 10, 
        name: 'Netflix', 
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.netflix.com'),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.netflix.com/browse'),
        position: 9
      },
      { 
        id: 11, 
        name: 'Twitch', 
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.twitch.tv'),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.twitch.tv/directory'),
        position: 10
      },
      { 
        id: 12, 
        name: 'Spotify', 
        appUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://open.spotify.com'),
        landingUrl: this.sanitizer.bypassSecurityTrustResourceUrl('https://open.spotify.com/browse/featured'),
        position: 11
      }
    ];
    
    // on met les positions
    this.widgets.forEach((w, i) => {
      w.position = i;
    });
  }
  
  ngAfterViewInit(): void {
    this.focusRenameInput();
  }
  
  // on check si le widget est visible
  isWidgetVisible(index: number): boolean {
    const start = this.currentPage * this.widgetsPerPage;
    const end = start + this.widgetsPerPage - 1;
    return index >= start && index <= end;
  }
  
  // pour le transform qd on drag
  getWidgetTransform(index: number): string {
    if (this.isInEditMode && this.dragStartIndex === index) {
      const x = this.dragCurrentIndex - this.dragStartIndex;
      const move = x * 120; // psk les widgets sont + petits maintnt
      return `translateX(${move}px)`;
    }
    return '';
  }
  
  // transition
  getWidgetTransition(index: number): string {
    if (this.widgetsMoving[index]) {
      return 'transform 0.3s ease';
    }
    return '';
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
  
  // touch
  onTouchStart(event: TouchEvent): void {
    if (this.isFullscreen || this.isInEditMode) return;
    
    this.touchStartX = event.touches[0].clientX;
  }
  
  onTouchMove(event: TouchEvent): void {
    if (this.isFullscreen || this.isInEditMode) return;
    
    this.touchMoveX = event.touches[0].clientX;
    
    const x = this.touchMoveX - this.touchStartX;
    
    if ((this.currentPage === 0 && x > 0) || 
        (this.currentPage === this.totalPages - 1 && x < 0)) {
      this.slideTranslation = x * 0.2;
    } else {
      this.slideTranslation = x;
    }
  }
  
  onTouchEnd(): void {
    if (this.isFullscreen || this.isInEditMode) return;
    
    const diff = this.touchMoveX - this.touchStartX;
    
    if (Math.abs(diff) > 100) {
      if (diff > 0 && this.currentPage > 0) {
        this.prevPage();
      } else if (diff < 0 && this.currentPage < this.totalPages - 1) {
        this.nextPage();
      }
    }
    
    this.slideTranslation = 0;
  }
  
  // page prec
  prevPage(): void {
    if (this.isInEditMode || this.isFullscreen) return;
    
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  // page suivante
  nextPage(): void {
    if (this.isInEditMode || this.isFullscreen) return;
    
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }
  
  // ouvre l'app en fullscreen
  openApp(widget: Widget): void {
    if (this.renamingWidget || this.isInEditMode) {
      return;
    }
    
    // go fullscreen
    console.log('Ouverture de', widget.name);
    this.currentLandingUrl = widget.landingUrl;
    this.isFullscreen = true;
  }
  
  // ferme le fullscreen
  closeFullscreen(): void {
    this.isFullscreen = false;
    this.currentLandingUrl = null;
  }
  
  // commence le drag (quand on est en mode edit)
  onMouseDown(event: MouseEvent, widget: Widget, index: number): void {
    if (!this.isInEditMode) {
      return;
    }
    
    // un clic sur le X = suppression en mode edit
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const isClickOnDelete = 
      event.clientX < rect.left + 20 && 
      event.clientY < rect.top + 20;
    
    if (isClickOnDelete) {
      this.deleteWidget(widget);
      return;
    }
    
    // pas de drag si clic droit
    if (event.button === 2) {
      return;
    }
    
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartIndex = index;
    this.dragCurrentIndex = index;
    
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }
  
  // pendant qu'on drag
  handleMouseMove = (event: MouseEvent) => {
    if (this.isInEditMode) {
      const diffX = event.clientX - this.dragStartX;
      
      const moveDistance = Math.round(diffX / 120);
      const newIdx = Math.max(0, Math.min(this.widgets.length - 1, this.dragStartIndex + moveDistance));
      
      if (newIdx !== this.dragCurrentIndex) {
        this.dragCurrentIndex = newIdx;
        
        for (let i = 0; i < this.widgets.length; i++) {
          this.widgetsMoving[i] = true;
        }
      }
    }
  }
  
  // fin du drag
  handleMouseUp = (event: MouseEvent) => {
    if (this.isInEditMode && this.dragStartIndex !== this.dragCurrentIndex) {
      // on reordonne
      const widgetToMove = this.widgets.splice(this.dragStartIndex, 1)[0];
      this.widgets.splice(this.dragCurrentIndex, 0, widgetToMove);
      
      // on reset les positions
      this.widgets.forEach((w, i) => {
        w.position = i;
      });
    }
    
    // reset les trucs
    this.widgetsMoving = {};
    
    // on enleve les listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
  
  // menu contextuel
  showContextMenu(event: MouseEvent, widget: Widget): void {
    event.preventDefault();
    
    if (this.isInEditMode) {
      return;
    }
    
    this.menuVisible = true;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    this.selectedWidget = widget;
    
    setTimeout(() => {
      document.addEventListener('click', this.hideContextMenu);
    }, 10);
  }
  
  // cache menu
  hideContextMenu = () => {
    this.menuVisible = false;
    document.removeEventListener('click', this.hideContextMenu);
  }
  
  // commence le mode edit (depuis menu)
  startEditMode(widget: Widget | null): void {
    if (!widget) return;
    
    this.menuVisible = false;
    this.isInEditMode = true;
    
    // ici tous les widgets sont en edit mode
    this.widgets.forEach(w => {
      this.editingWidgets[w.id] = true;
    });
    
    console.log('Mode édition: toutes les apps tremblent!');
  }
  
  // arrete mode edit
  stopEditMode(): void {
    this.isInEditMode = false;
    this.editingWidgets = {}; // on reset
  }
  
  // renomme
  startRename(widget: Widget | null): void {
    if (!widget) return;
    
    this.menuVisible = false;
    this.renamingWidget = widget;
    
    setTimeout(() => {
      this.focusRenameInput();
    }, 10);
  }
  
  // focus le input
  focusRenameInput(): void {
    if (this.renameInput && this.renamingWidget) {
      this.renameInput.nativeElement.focus();
      this.renameInput.nativeElement.select();
    }
  }
  
  // quand on fini le rename
  finishRename(event: Event): void {
    if (this.renamingWidget) {
      const input = event.target as HTMLInputElement;
      const newName = input.value.trim();
      
      if (newName) {
        this.renamingWidget.name = newName;
      }
      
      this.renamingWidget = null;
    }
  }
  
  // delete une app
  deleteWidget(widget: Widget | null): void {
    if (!widget) return;
    
    if (this.renamingWidget) {
      return;
    }
    
    const index = this.widgets.findIndex(w => w.id === widget.id);
    if (index !== -1) {
      this.widgets.splice(index, 1);
      
      // recalcul des positions
      this.widgets.forEach((w, i) => {
        w.position = i;
      });
      
      // va page précédente si necessaire
      if (this.visibleWidgets.length === 0 && this.currentPage > 0) {
        this.currentPage--;
      }
    }
    
    this.hideContextMenu();
  }
  
  // si on click ailleurs
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // si on clique "terminer" (en haut) ou ailleurs que dans le dashboard
    if (this.isInEditMode) {
      const clickedWidget = (event.target as HTMLElement).closest('.widget-wrapper');
      const clickedDone = (event.target as HTMLElement).closest('.edit-done-btn');
      
      if (clickedDone || (!clickedWidget && !clickedDone)) {
        this.stopEditMode();
      }
    }
    
    // cache le menu si on click ailleurs
    const clickedInMenu = (event.target as HTMLElement).closest('.widget-menu');
    if (!clickedInMenu) {
      this.menuVisible = false;
    }
  }
  
  // pour vérifier si un widget est en mode edit
  isEditing(widget: Widget): boolean {
    return this.isInEditMode && this.editingWidgets[widget.id];
  }
}