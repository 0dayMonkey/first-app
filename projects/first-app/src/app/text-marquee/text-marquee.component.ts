import { Component, Input, AfterViewInit, ElementRef, ViewChild, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-text-marquee',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="marquee-container" 
         [style.width.px]="containerWidth">
      <div #textElement 
           class="marquee-text" 
           [class.animate]="shouldAnimate" 
           [style.animationDuration]="marqueeSpeed + 's'"
           [style.animationDelay]="marqueeDelay + 's'">
        <span class="text-content">{{ text }}</span>
        <span class="text-duplicate" *ngIf="shouldAnimate">{{ text }}</span>
      </div>
    </div>
  `,
  styles: [`
    .marquee-container {
      overflow: hidden;
      white-space: nowrap;
      position: relative;
    }
    
    .marquee-text {
      display: inline-block;
      white-space: nowrap;
      position: relative;
    }
    
    .text-content {
      display: inline-block;
    }
    
    .text-duplicate {
      display: inline-block;
      padding-left: 20px;
    }
    
    .animate.marquee-text {
      animation-name: marqueeAnim;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      animation-fill-mode: forwards;
    }
    
    @keyframes marqueeAnim {
      0% {
        transform: translateX(0);
      }
      45% {
        transform: translateX(calc(-100% + 20px));
      }
      45.01% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(0);
      }
    }
  `]
})
export class TextMarqueeComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() text: string = '';
  @Input() containerWidth: number = 0;
  @Input() maxCharLength: number = 0;
  
  @ViewChild('textElement') textElement!: ElementRef;
  
  shouldAnimate: boolean = false;
  marqueeSpeed: number = 0;
  marqueeDelay: number = 0;
  configSubscription: Subscription | null = null;
  
  constructor(private configService: ConfigService) {}
  
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
    this.marqueeSpeed = this.configService.getValue('animations.TITLE_MARQUEE_SPEED', 100);
    this.marqueeDelay = this.configService.getValue('animations.TITLE_MARQUEE_DELAY', 2);
    
    // Si les propriétés n'ont pas été définies par les inputs, les charger de la config
    if (this.containerWidth <= 0) {
      this.containerWidth = this.configService.getValue('animations.TITLE_CONTAINER_WIDTH', 180);
    }
    
    if (this.maxCharLength <= 0) {
      this.maxCharLength = this.configService.getValue('animations.TITLE_MIN_CHARS', 20);
    }
    
    console.log(`TextMarquee mis à jour: vitesse=${this.marqueeSpeed}s, délai=${this.marqueeDelay}s, largeur=${this.containerWidth}px, min chars=${this.maxCharLength}`);
    
    // Vérifier immédiatement si le texte doit être animé
    setTimeout(() => this.checkTextOverflow(), 50);
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.checkTextOverflow();
    }, 50);
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['text']) {
      setTimeout(() => {
        this.checkTextOverflow();
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
    
    // Ensuite vérifier si le texte est visuellement trop long pour le conteneur
    if (this.textElement && this.textElement.nativeElement) {
      const textWidth = this.textElement.nativeElement.querySelector('.text-content').offsetWidth;
      this.shouldAnimate = textWidth > this.containerWidth;
      
      console.log(`Texte: "${this.text}", Longueur: ${this.text.length}, Largeur: ${textWidth}px, Container: ${this.containerWidth}px, Animation: ${this.shouldAnimate}`);
    } else {
      // Fallback si l'élément n'est pas encore rendu
      this.shouldAnimate = this.text.length > this.maxCharLength;
    }
  }
}