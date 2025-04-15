import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

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
export class PinCodeComponent {
  voucherCode: string = '';
  
  // Format attendu: xx-xxxx-xxxx-xxxx-xxxx
  readonly validCodePattern = /^\w{2}-\w{4}-\w{4}-\w{4}-\w{4}$/;

  constructor(private router: Router) {}

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
    
    // Limiter la longueur à 18 caractères (correspond à XX-XXXX-XXXX-XXXX-XXXX)
    if (rawCode.length < 18) {
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
   * Formate automatiquement le code avec des tirets
   */
  formatCode(rawCode: string): void {
    // Convertir en majuscules
    rawCode = rawCode.toUpperCase();
    
    let formattedCode = '';
    
    // Reformater avec des tirets
    if (rawCode.length > 0) {
      formattedCode = rawCode.substring(0, Math.min(2, rawCode.length));
      
      if (rawCode.length > 2) {
        formattedCode += '-' + rawCode.substring(2, Math.min(6, rawCode.length));
      }
      
      if (rawCode.length > 6) {
        formattedCode += '-' + rawCode.substring(6, Math.min(10, rawCode.length));
      }
      
      if (rawCode.length > 10) {
        formattedCode += '-' + rawCode.substring(10, Math.min(14, rawCode.length));
      }
      
      if (rawCode.length > 14) {
        formattedCode += '-' + rawCode.substring(14, Math.min(18, rawCode.length));
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