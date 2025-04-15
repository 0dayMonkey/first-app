import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLandingPage = false;
  isMypromoPage = false;
  isPinCodePage = false;
  isPromoResultPage = false;
  pageTitle = 'Dashboard';
  
  constructor(
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLandingPage = event.url.includes('/landingPage');
      this.isMypromoPage = event.url.includes('/mypromo');
      this.isPinCodePage = event.url.includes('/pin-code');
      this.isPromoResultPage = event.url.includes('/promo-result');
      
      // Déterminer le titre en fonction de la page
      if (this.isLandingPage) {
        this.pageTitle = 'Application';
      } else if (this.isMypromoPage) {
        this.pageTitle = 'Mypromo';
      } else if (this.isPinCodePage) {
        this.pageTitle = 'Code Voucher';
      } else if (this.isPromoResultPage) {
        this.pageTitle = 'Résultat';
      } else {
        this.pageTitle = 'Dashboard';
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  
  const addPromotion = (title: string, value: string): void => {
  interface Promo {
    id: string;
    title: string;
    value: string;
    selected: boolean;
  }
  
  const promos: Promo[] = JSON.parse(localStorage.getItem('mypromo_promos') || '[]');
  promos.push({
    id: Date.now().toString(),
    title: title,
    value: value,
    selected: false
  });
  localStorage.setItem('mypromo_promos', JSON.stringify(promos));
  console.log(`Promotion "${title}" add avec succes`);
};

addPromotion('Code Halloween', '666 crédits spéciaux');
  
  }

  goBack(): void {
    if (this.isMypromoPage || this.isPinCodePage || this.isPromoResultPage) {
      this.router.navigate(['/']);
    } else {
      this.location.back();
    }
  }
}