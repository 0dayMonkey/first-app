import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

import { PromoService } from '../services/promo.service';
import { ConfigService } from '../services/config.service';
import { Promo } from '../models/promo.model';
import { TextMarqueeComponent } from '../text-marquee/text-marquee.component';

@Component({
  selector: 'app-mypromo',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatRippleModule,
    MatButtonModule,
    TextMarqueeComponent
  ],
  templateUrl: './mypromo.component.html',
  styleUrls: ['./mypromo.component.scss']
})
export class MypromoComponent implements OnInit, AfterViewInit {
  promos: Promo[] = [];
  
  // Paramètres configurables
  titleContainerWidth: number = 180;
  titleMinChars: number = 20;
  animationRedeem: boolean = true;
  validationDelay: number = 300;
  
  constructor(
    private promoService: PromoService,
    private configService: ConfigService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    // Charger la configuration
    this.titleContainerWidth = this.configService.getValue('animations.TITLE_CONTAINER_WIDTH', 180);
    this.titleMinChars = this.configService.getValue('animations.TITLE_MIN_CHARS', 20);
    this.animationRedeem = this.configService.getValue('animations.ANIMATION_REDEEM', true);
    this.validationDelay = this.configService.getValue('animations.VALIDATION_ANIMATION_DURATION', 300);
    
    console.log(`MyPromo initialisé avec: largeur=${this.titleContainerWidth}px, min chars=${this.titleMinChars}, animation=${this.animationRedeem}`);
  }

  ngOnInit(): void {
    // S'abonner aux mises à jour des promotions
    this.promoService.getPromos().subscribe(promos => {
      console.log(`MyPromoComponent: Mise à jour des promos, ${promos.length} restantes`);
      
      // S'assurer que chaque promotion a la propriété selected définie
      this.promos = promos.map(promo => ({
        ...promo,
        selected: promo.selected === undefined ? false : promo.selected
      }));
    });
  }
  
  ngAfterViewInit(): void {
    // Correction pour le défilement après le rendu de la vue
    setTimeout(() => {
      const scrollContainer = this.elementRef.nativeElement.querySelector('.promo-list-container');
      if (scrollContainer) {
        // Force le style de défilement
        scrollContainer.style.overflowY = 'auto';
        scrollContainer.style.height = 'calc(100% - 30px)'; // Laisser un peu d'espace pour éviter les débordements
        
        // Ajouter un événement de défilement pour vérifier qu'il fonctionne
        scrollContainer.addEventListener('scroll', () => {
          console.log('Scrolling works!');
        });
      }
    }, 100);
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
   * Valide la promotion sélectionnée avec animation de confirmation
   */
  validatePromo(promo: Promo, event: Event): void {
    event.stopPropagation(); // Empêche le déclenchement du onPromoClick
    
    console.log(`Validation de la promo ID: ${promo.id}, Titre: ${promo.title}`);
    
    // Vérifier que la promo a un ID valide
    if (!promo.id) {
      console.error('Promo sans ID détectée:', promo);
      // Générer un ID temporaire si nécessaire
      promo.id = Date.now().toString();
    }
    
    // Animation conditionnelle basée sur la configuration
    if (this.animationRedeem) {
      const promoElement = (event.currentTarget as HTMLElement).closest('.promo-item') as HTMLElement;
      if (promoElement) {
        promoElement.classList.add('validating');
      
        setTimeout(() => {
          this.router.navigate(['/promo-result'], { 
            queryParams: { 
              promoId: promo.id,
              promoTitle: promo.title,
              promoValue: promo.value
            }
          });
        }, this.validationDelay);
      } else {
        // Navigation immédiate si l'élément n'est pas trouvé
        this.navigateToResult(promo);
      }
    } else {
      // Navigation immédiate si l'animation est désactivée
      this.navigateToResult(promo);
    }
  }
  
  /**
   * Navigation vers la page de résultat
   */
  private navigateToResult(promo: Promo): void {
    this.router.navigate(['/promo-result'], { 
      queryParams: { 
        promoId: promo.id,
        promoTitle: promo.title,
        promoValue: promo.value
      }
    });
  }
}