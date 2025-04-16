import { Component, Input, AfterViewInit, ElementRef, ViewChild, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-text-marquee',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="marquee-container" [style.width.px]="containerWidth">
      <div *ngIf="!shouldAnimate || !selected">
        <span class="text-content">{{ text }}</span>
      </div>
      <div *ngIf="shouldAnimate && selected" class="marquee-wrapper">
        <div class="marquee">
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
      position: relative;
    }
    
    .text-content {
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    
    .marquee-wrapper {
      width: 100%;
      overflow: hidden;
    }
    
    .marquee {
      display: inline-block;
      white-space: nowrap;
      animation: marquee-scroll linear infinite;
    }
    
    .marquee span {
      display: inline-block;
      padding-right: 20px;
    }
    
    @keyframes marquee-scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }
  `]
})
export class TextMarqueeComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() text: string = '';
  @Input() containerWidth: number = 0;
  @Input() maxCharLength: number = 0;
  @Input() selected: boolean = false;
  
  @ViewChild('textElement') textElement!: ElementRef;
  
  shouldAnimate: boolean = false;
  marqueeSpeed: number = 10;
  configSubscription: Subscription | null = null;
  
  constructor(private configService: ConfigService, private el: ElementRef) {}
  
  ngOnInit() {
    // Charger la configuration initiale
    this.loadConfig();
    
    // S'abonner aux changements de configuration
    this.configSubscription = this.configService.getConfig().subscribe(config => {
      if (config) {
        this.loadConfig();
      }
    });
  }
  
  private loadConfig() {
    // Charger les paramètres depuis la configuration
    this.marqueeSpeed = this.configService.getValue('animations.TITLE_MARQUEE_SPEED', 10);
    
    // Si les propriétés n'ont pas été définies par les inputs, les charger de la config
    if (this.containerWidth <= 0) {
      this.containerWidth = this.configService.getValue('animations.TITLE_CONTAINER_WIDTH', 180);
    }
    
    if (this.maxCharLength <= 0) {
      this.maxCharLength = this.configService.getValue('animations.TITLE_MIN_CHARS', 20);
    }
    
    // Vérifier immédiatement si le texte doit être animé
    setTimeout(() => this.checkTextOverflow(), 50);
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.checkTextOverflow();
      this.applyMarqueeAnimation();
    }, 50);
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['text'] || changes['selected']) {
      setTimeout(() => {
        this.checkTextOverflow();
        this.applyMarqueeAnimation();
      }, 50);
    }
  }
  
  ngOnDestroy() {
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
  }
  
  /**
   * Vérifie si le texte déborde de son conteneur et active l'animation si nécessaire
   */
  checkTextOverflow() {
    // D'abord vérifier si le texte est assez long pour mériter une animation
    if (this.text.length <= this.maxCharLength) {
      this.shouldAnimate = false;
      return;
    }
    
    // Vérifier la largeur du texte
    const tempElement = document.createElement('span');
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.innerText = this.text;
    document.body.appendChild(tempElement);
    
    const textWidth = tempElement.getBoundingClientRect().width;
    document.body.removeChild(tempElement);
    
    this.shouldAnimate = textWidth > this.containerWidth;
  }
  
  /**
   * Applique l'animation de défilement avec la bonne vitesse
   */
  applyMarqueeAnimation() {
    if (this.shouldAnimate && this.selected) {
      // Calculer une vitesse appropriée basée sur la longueur du texte
      const tempElement = document.createElement('span');
      tempElement.style.visibility = 'hidden';
      tempElement.style.position = 'absolute';
      tempElement.style.whiteSpace = 'nowrap';
      tempElement.innerText = this.text;
      document.body.appendChild(tempElement);
      
      const textWidth = tempElement.getBoundingClientRect().width;
      document.body.removeChild(tempElement);
      
      // La durée de l'animation dépend de la longueur du texte
      // Plus le texte est long, plus l'animation doit être lente pour rester lisible
      const duration = Math.max(5, textWidth / 50);
      
      // Appliquer l'animation CSS via le style injecté
      const marqueeElements = this.el.nativeElement.querySelectorAll('.marquee');
      marqueeElements.forEach((element: HTMLElement) => {
        element.style.animationDuration = `${duration}s`;
      });
    }
  }
}