import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Widget } from '../../models/widget';

@Component({
  selector: 'app-widget-item',
  templateUrl: './widget-item.component.html',
  styleUrls: ['./widget-item.component.scss']
})
export class WidgetItemComponent implements OnInit {
  @Input() widget: Widget;
  @Output() widgetClick = new EventEmitter<string>();
  @ViewChild('iframe') iframeElement: ElementRef;
  
  safeUrl: SafeResourceUrl;
  isLoading = true;
  hasError = false;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    // Sécuriser l'URL pour l'iframe
    if (this.widget && this.widget.url) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.widget.url);
    }
  }

  onWidgetClick(): void {
    this.widgetClick.emit(this.widget.id);
  }

  onIframeLoad(): void {
    this.isLoading = false;
    this.hasError = false;
  }

  onIframeError(): void {
    this.isLoading = false;
    this.hasError = true;
  }
}