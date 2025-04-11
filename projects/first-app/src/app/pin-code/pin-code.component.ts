import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-pin-code',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './pin-code.component.html',
  styleUrls: ['./pin-code.component.scss']
})
export class PinCodeComponent {
  voucherCode: string = '';
  message: string = '';
  showError: boolean = false;
  
  // Format attendu: xx-xxxx-xxxx-xxxx-xxxx
  readonly validCodePattern = /^\w{2}-\w{4}-\w{4}-\w{4}-\w{4}$/;

  constructor(private router: Router) {}

  /**
   * Valide le code voucher saisi
   */
  validateCode(): void {
    if (this.voucherCode.match(this.validCodePattern)) {
      this.message = 'Code valide !';
      this.showError = false;
      setTimeout(() => {
        // Naviguer vers la page de résultat pour une promo spéciale
        this.router.navigate(['/promo-result'], { 
          queryParams: { 
            promoTitle: 'Code Voucher', 
            promoValue: '500 crédits premium'
          }
        });
      }, 1000);
    } else {
      this.message = 'Format de code invalide. Veuillez respecter le format XX-XXXX-XXXX-XXXX-XXXX.';
      this.showError = true;
    }
  }

  /**
   * Formate automatiquement le code pendant la saisie
   */
  formatCode(): void {
    // Supprimer tous les tirets
    let rawCode = this.voucherCode.replace(/-/g, '');
    // Convertir en majuscules
    rawCode = rawCode.toUpperCase();
    
    let formattedCode = '';
    
    // Reformater avec des tirets
    if (rawCode.length > 0) {
      formattedCode = rawCode.substring(0, 2);
      
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
    this.message = '';
    this.showError = false;
  }
}