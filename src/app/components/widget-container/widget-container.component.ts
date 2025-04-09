import { Component, OnInit } from '@angular/core';
import { WidgetService } from '../../services/widget.service';
import { Widget } from '../../models/widget';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-widget-container',
  templateUrl: './widget-container.component.html',
  styleUrls: ['./widget-container.component.scss']
})
export class WidgetContainerComponent implements OnInit {
  widgets$: Observable<Widget[]>;
  
  constructor(private widgetService: WidgetService) { }

  ngOnInit(): void {
    // Récupérer la liste des widgets depuis le service
    this.widgets$ = this.widgetService.getWidgets();
  }

  onWidgetSelected(widgetId: string): void {
    // Activer le widget sélectionné
    this.widgetService.activateWidget(widgetId);
    
    // Ici, vous pourriez ajouter une logique supplémentaire
    // comme la redirection vers une landing page
    console.log(`Widget selected: ${widgetId}`);
  }
}