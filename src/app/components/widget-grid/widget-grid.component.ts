import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Widget } from '../../models/widget.model';
import { WidgetService } from '../../services/widget.service';

@Component({
  selector: 'app-widget-grid',
  templateUrl: './widget-grid.component.html',
  styleUrls: ['./widget-grid.component.scss']
})
export class WidgetGridComponent implements OnInit {
  widgets$!: Observable<Widget[]>;

  constructor(private widgetService: WidgetService) { }

  ngOnInit(): void {
    this.widgets$ = this.widgetService.getWidgets();
  }

  onWidgetClick(widgetId: string): void {
    this.widgetService.navigateToApp(widgetId);
  }

  getWidgetRows(widgets: Widget[], itemsPerRow: number = 4): Widget[][] {
    const rows: Widget[][] = [];
    
    for (let i = 0; i < widgets.length; i += itemsPerRow) {
      rows.push(widgets.slice(i, i + itemsPerRow));
    }
    
    return rows;
  }
}