import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PromoService } from './services/promo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'dashboard-app';
  
  constructor(
    private router: Router,
    private promoService: PromoService
  ) {}
  
  ngOnInit(): void {
    // Surveiller les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Si on retourne au dashboard, mettre à jour les notifications
      if (event.url === '/') {
        setTimeout(() => {
          // Mettre à jour les notifications après un court délai
          this.promoService.updateNotificationsBasedOnPromos();
        }, 100);
      }
    });
  }
}