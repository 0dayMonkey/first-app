import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

import { HeaderComponent } from '../header/header.component';
import { PromoService } from '../services/promo.service';
import { Promo } from '../models/promo.model';

@Component({
  selector: 'app-mypromo',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    MatIconModule,
    MatRippleModule
  ],
  templateUrl: './mypromo.component.html',
  styleUrls: ['./mypromo.component.scss']
})
export class MypromoComponent implements OnInit {
  promos: Promo[] = [];
  
  constructor(
    private promoService: PromoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner aux mises à jour des promotions
    this.promoService.getPromos().subscribe(promos => {
      this.promos = promos;
    });
  }

  /**
   * Retourne la classe d'icône en fonction du type de promotion
   */
  getPromoIconClass(promo: Promo): string {
    if (promo.title.toLowerCase().includes('vendredi')) {
      return 'calendar-icon';
    } else if (promo.title.toLowerCase().includes('pâques')) {
      return 'gift-icon';
    } else if (promo.title.toLowerCase().includes('été')) {
      return 'summer-icon';
    }
    return 'gift-icon';
  }



  getPromoIcon(promo: Promo): string {
    if (promo.title.toLowerCase().includes('vendredi')) {
      return 'event';
    } else if (promo.title.toLowerCase().includes('pâques')) {
      return 'card_giftcard';
    } else if (promo.title.toLowerCase().includes('été')) {
      return 'wb_sunny';
    }
    return 'card_giftcard';
  }

  /**
   * Gère le clic sur une promotion
   */
  onPromoClick(promo: Promo): void {
    this.promoService.selectPromo(promo.id);
  }

  /**
   * Ouvre la page pour saisir un code PIN
   */
  openPinCodePage(): void {
    this.router.navigate(['/pin-code']);
  }

  /**
   * Valide la promotion sélectionnée
   */
  validatePromo(promo: Promo, event: Event): void {
    event.stopPropagation(); // Empêche le déclenchement du onPromoClick
    this.router.navigate(['/promo-result'], { 
      queryParams: { 
        promoId: promo.id,
        promoTitle: promo.title,
        promoValue: promo.value
      }
    });
  }
}