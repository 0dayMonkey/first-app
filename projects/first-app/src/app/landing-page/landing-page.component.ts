import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  appUrl: SafeResourceUrl | null = null;
  appName: string = '';
  loading: boolean = true;
  
  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Récupérer les paramètres de l'URL
    this.route.queryParams.subscribe(params => {
      if (params['url']) {
        // Sanitize URL pour éviter les problèmes de sécurité
        this.appUrl = this.sanitizer.bypassSecurityTrustResourceUrl(params['url']);
        this.appName = params['name'] || 'Application';
        this.loading = false;
      }
    });
  }

  /**
   * Gère l'événement de chargement de l'iframe
   */
  onIframeLoad(): void {
    this.loading = false;
  }
}