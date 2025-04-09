import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Widget } from '../../models/widget';

@Component({
  selector: 'app-widget-grid',
  templateUrl: './widget-grid.component.html',
  styleUrls: ['./widget-grid.component.scss']
})
export class WidgetGridComponent implements OnInit {
  @Input() widgets: Widget[] = [];
  @Output() widgetSelected = new EventEmitter<string>();
  
  // Configuration pour la grille (nombre de widgets par ligne selon la taille d'écran)
  gridConfig = {
    columns: 3, // Nombre de colonnes par défaut pour la taille d'écran (1240px)
    gap: 16    // Espace entre les widgets
  };

  constructor() { }

  ngOnInit(): void {
    // Ajuster le nombre de colonnes en fonction de la taille de l'écran si nécessaire
    this.adjustGridForScreenSize();
    
    // Surveiller les changements de taille d'écran
    window.addEventListener('resize', () => {
      this.adjustGridForScreenSize();
    });
  }

  private adjustGridForScreenSize(): void {
    const screenWidth = window.innerWidth;
    
    if (screenWidth <= 768) {
      this.gridConfig.columns = 2; // 2 colonnes pour les petits écrans
    } else if (screenWidth <= 1240) {
      this.gridConfig.columns = 3; // 3 colonnes pour les écrans moyens
    } else {
      this.gridConfig.columns = 4; // 4 colonnes pour les grands écrans
    }
  }

  onWidgetClick(widgetId: string): void {
    this.widgetSelected.emit(widgetId);
  }

  // Structurer les widgets en lignes pour l'affichage en grille
  getWidgetRows(): Widget[][] {
    const rows: Widget[][] = [];
    let currentRow: Widget[] = [];
    
    this.widgets.forEach((widget, index) => {
      currentRow.push(widget);
      
      if ((index + 1) % this.gridConfig.columns === 0 || index === this.widgets.length - 1) {
        rows.push([...currentRow]);
        currentRow = [];
      }
    });
    
    return rows;
  }
}