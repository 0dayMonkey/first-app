import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-text-marquee',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="marquee-container" [style.width.px]="containerWidth">
      <!-- Version statique (toujours visible) -->
      <span *ngIf="!selected" class="static-text">{{ text }}</span>
      
      <!-- Version animée uniquement lorsque sélectionné -->
      <div *ngIf="selected" class="marquee">
        <div class="marquee-inner">
          <span>{{ text }}</span>
          <span>{{ text }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .marquee-container {
      overflow: hidden;
      white-space: nowrap;
    }
    
    .static-text {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .marquee {
      width: 100%;
      overflow: hidden;
    }
    
    .marquee-inner {
      display: inline-block;
      white-space: nowrap;
      animation: marquee 8s linear infinite;
    }
    
    .marquee-inner span {
      display: inline-block;
      padding-right: 30px;
    }
    
    @keyframes marquee {
      0% { transform: translate(0, 0); }
      20% { transform: translate(0, 0); } /* Pause de 20% au début */
      80% { transform: translate(-50%, 0); } /* Défilement sur 60% du temps */
      100% { transform: translate(-50%, 0); } /* Pause de 20% à la fin */
    }
  `]
})
export class TextMarqueeComponent implements OnInit {
  @Input() text: string = '';
  @Input() containerWidth: number = 180;
  @Input() maxCharLength: number = 20;
  @Input() selected: boolean = false;
  
  constructor(private configService: ConfigService) {}
  
  ngOnInit() {
    // Charger les paramètres depuis la configuration
    this.containerWidth = this.configService.getValue('animations.TITLE_CONTAINER_WIDTH', 180);
    this.maxCharLength = this.configService.getValue('animations.TITLE_MIN_CHARS', 20);
    
    // Appliquer les paramètres d'animation
    const animationStyle = document.createElement('style');
    const speed = this.configService.getValue('animations.TITLE_MARQUEE_SPEED', 8);
    const delay = this.configService.getValue('animations.TITLE_MARQUEE_DELAY', 2);
    
    // Calcul des pourcentages pour le timing de l'animation
    const delayPercent = (delay / speed) * 25; // Convertir en pourcentage du temps total
    
    animationStyle.textContent = `
      @keyframes marquee {
        0% { transform: translate(0, 0); }
        ${delayPercent}% { transform: translate(0, 0); }
        ${100 - delayPercent}% { transform: translate(-50%, 0); }
        100% { transform: translate(-50%, 0); }
      }
      .marquee-inner {
        animation-duration: ${speed}s;
      }
    `;
    
    document.head.appendChild(animationStyle);
  }
}