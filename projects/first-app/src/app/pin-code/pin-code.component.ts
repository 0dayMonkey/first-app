import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-pin-code',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './pin-code.component.html',
  styleUrls: ['./pin-code.component.scss']
})
export class PinCodeComponent implements OnInit {
  voucherCode: string = '';
  
  // Paramètres configurables
  voucherCodeFormat: string = 'XX-XXXX-XXXX-XXXX-XXXX'; // Format pour formatage
  validCodePattern: RegExp; // Expression régulière de validation
  placeholderText: string = 'XX-XXXX-XXXX-XXXX-XXXX'; // Texte placeholder
  pinTitle: string = 'Entrez votre code voucher';
  clearButtonText: string = 'C';
  validateButtonText: string = 'VALIDER LE CODE';
  
  constructor(
    private router: Router,
    private configService: ConfigService
  ) {
    // Initialisation avec valeur par défaut
    this.validCodePattern = /^\w{2}-\w{4}-\w{4}-\w{4}-\w{4}$/;
  }
  
  ngOnInit(): void {
    // Charger les paramètres depuis la configuration
    this.voucherCodeFormat = this.configService.getValue('promotions.VOUCHER_CODE_FORMAT', 'XX-XXXX-XXXX-XXXX-XXXX');
    this.placeholderText = this.configService.getValue('pincode.PLACEHOLDER_TEXT', this.voucherCodeFormat);
    this.pinTitle = this.configService.getValue('pincode.PIN_TITLE', 'Entrez votre code voucher');
    this.clearButtonText = this.configService.getValue('pincode.CLEAR_BUTTON_TEXT', 'C');
    this.validateButtonText = this.configService.getValue('pincode.VALIDATE_BUTTON_TEXT', 'VALIDER LE CODE');
    
    // Créer un RegExp à partir de la chaîne stockée dans la configuration
    const pattern = this.configService.getValue('promotions.VOUCHER_CODE_PATTERN', '^\\w{2}-\\w{4}-\\w{4}-\\w{4}-\\w{4}$');
    try {
      this.validCodePattern = new RegExp(pattern);
    } catch (error) {
      console.error('Format de RegExp invalide dans la configuration:', error);
      // Conserver la valeur par défaut
    }
    
    console.log(`PinCode initialisé avec format: ${this.voucherCodeFormat}, pattern: ${this.validCodePattern}, placeholder: ${this.placeholderText}`);
  }

  /**
   * Valide le code voucher saisi
   */
  validateCode(): void {
    if (this.voucherCode.match(this.validCodePattern)) {
      // Naviguer vers la page de résultat pour une promo spéciale
      this.router.navigate(['/promo-result'], { 
        queryParams: { 
          promoTitle: 'Code Voucher', 
          promoValue: '500 crédits premium'
        }
      });
    }
  }

  /**
   * Ajoute un caractère au code
   */
  appendDigit(digit: string): void {
    // Supprimer tous les tirets actuels
    let rawCode = this.voucherCode.replace(/-/g, '');
    
    // Limiter la longueur basée sur le format dans la configuration
    const maxLength = this.voucherCodeFormat.replace(/-/g, '').length;
    
    if (rawCode.length < maxLength) {
      rawCode += digit;
    }
    
    // Reformater avec des tirets
    this.formatCode(rawCode);
  }
  
  /**
   * Supprime le dernier caractère du code
   */
  removeLastDigit(): void {
    // Supprimer tous les tirets actuels
    let rawCode = this.voucherCode.replace(/-/g, '');
    
    // Supprimer le dernier caractère
    if (rawCode.length > 0) {
      rawCode = rawCode.substring(0, rawCode.length - 1);
    }
    
    // Reformater avec des tirets
    this.formatCode(rawCode);
  }

  /**
   * Formate automatiquement le code avec des tirets selon le format configuré
   */
  formatCode(rawCode: string): void {
    // Convertir en majuscules
    rawCode = rawCode.toUpperCase();
    
    // Obtenir le format depuis la configuration
    const format = this.voucherCodeFormat;
    const segments = format.split('-');
    
    let formattedCode = '';
    let currentPosition = 0;
    
    // Pour chaque segment du format, extraire la partie correspondante du code brut
    for (let i = 0; i < segments.length; i++) {
      const segmentLength = segments[i].length;
      
      if (currentPosition < rawCode.length) {
        const end = Math.min(currentPosition + segmentLength, rawCode.length);
        const segment = rawCode.substring(currentPosition, end);
        
        if (formattedCode === '') {
          formattedCode = segment;
        } else {
          formattedCode += '-' + segment;
        }
        
        currentPosition += segmentLength;
      }
    }
    
    this.voucherCode = formattedCode;
  }
  
  /**
   * Réinitialise le code
   */
  clearCode(): void {
    this.voucherCode = '';
  }
}