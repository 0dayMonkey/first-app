import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild } from '@angular/core'; 
import { Widget } from '../../models/widget.model'; 
import { WidgetService } from '../../services/widget.service'; 
 
@Component({ 
  selector: 'app-widget-item', 
  templateUrl: './widget-item.component.html', 
  styleUrls: ['./widget-item.component.scss'] 
}) 
export class WidgetItemComponent implements OnInit { 
  @Input() widget!: Widget; 
  @Output() widgetClick = new EventEmitter<string>(); 
  @ViewChild('iframe') iframeElement!: ElementRef; 
 
  isLoading = true; 
  hasError = false; 
 
  constructor(private widgetService: WidgetService) { } 
 
  ngOnInit(): void { 
    // Initialisation du composant 
  } 
 
  onWidgetClick(): void { 
    this.widgetClick.emit(this.widget.id); 
  } 
 
  onIframeLoad(): void { 
    this.isLoading = false; 
    this.widgetService.updateWidgetStatus(this.widget.id, true, false); 
  } 
 
  onIframeError(): void { 
    this.isLoading = false; 
    this.hasError = true; 
    this.widgetService.updateWidgetStatus(this.widget.id, true, true); 
  } 
} 
