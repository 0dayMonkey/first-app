import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../header/header.component';
import { PromoService } from '../services/promo.service';

@Component({
  selector: 'app-promo-result',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    MatIconModule
  ],
  templateUrl: './promo-result.component.html',
  styleUrls: ['./promo-result.component.scss']
})
export class PromoResultComponent implements OnInit, OnDestroy {
  promoId: string = '';
  promoTitle: string = '';
  promoValue: string = '';
  countdown: number = 30;
  private timer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private promoService: PromoService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.promoId = params['promoId'] || '';
      this.promoTitle = params['promoTitle'] || 'Promotion';
      this.promoValue = params['promoValue'] || '';
      
      // Supprimer la promotion si un ID est fourni
      if (this.promoId) {
        this.promoService.removePromo(this.promoId);
      }
    });

    // Démarrer le compte à rebours
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.navigateBack();
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * Retourne à la page des promotions
   */
  navigateBack(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.router.navigate(['/mypromo']);
  }


  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-header')) {
      this.navigateBack();
    }
  }
}