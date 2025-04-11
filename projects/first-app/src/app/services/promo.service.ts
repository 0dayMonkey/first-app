import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Promo } from '../models/promo.model';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';

/**
 * Service de gestion des promotions
 */
@Injectable({
  providedIn: 'root'
})
export class PromoService {
  private promos: Promo[] = [];
  private promosSubject = new BehaviorSubject<Promo[]>([]);
  private readonly PROMO_APP_ID = 'mypromo-app-id';
  private readonly STORAGE_KEY = 'mypromo_promos';
  
  constructor(
    private storageService: StorageService,
    private notificationService: NotificationService
  ) {
    this.loadPromos();
    
    // Si aucune promo n'est chargée, initialiser avec des valeurs par défaut
    if (this.promos.length === 0) {
      this.initializeDefaultPromos();
    }
    
    // Mettre à jour les notifications pour correspondre au nombre de promos
    this.updateNotificationsBasedOnPromos();
  }
  
  /**
   * Récupère la liste des promotions
   */
  getPromos(): Observable<Promo[]> {
    return this.promosSubject.asObservable();
  }
  
  /**
   * Sélectionne une promotion
   */
  selectPromo(id: string): void {
    this.promos = this.promos.map(promo => ({
      ...promo,
      selected: promo.id === id
    }));
    
    this.savePromos();
    this.promosSubject.next(this.promos);
  }
  
  /**
   * Vérifie si un code voucher est valide
   */
  validateVoucherCode(code: string): boolean {
    // Dans un environnement réel, cette validation se ferait côté serveur
    const validPattern = /^\w{2}-\w{4}-\w{4}-\w{4}-\w{4}$/;
    return validPattern.test(code);
  }
  
  /**
   * Supprime une promotion après utilisation
   */
  removePromo(id: string): void {
    this.promos = this.promos.filter(promo => promo.id !== id);
    this.savePromos();
    this.promosSubject.next(this.promos);
    
    // Mettre à jour les notifications
    this.updateNotificationsBasedOnPromos();
  }
  
  /**
   * Initialise les promotions par défaut
   */
  private initializeDefaultPromos(): void {
    this.promos = [
      {
        id: '1',
        title: 'Vendredi 13',
        value: '13 € offerts',
        selected: false
      },
      {
        id: '2',
        title: 'Pâques',
        value: '100 crédits promo',
        selected: false
      },
      {
        id: '3',
        title: 'Été 2025',
        value: '25 crédits regular',
        selected: false
      }
    ];
    
    this.savePromos();
    this.promosSubject.next(this.promos);
    
    // Mettre à jour les notifications
    this.updateNotificationsBasedOnPromos();
  }
  
  /**
   * Met à jour les notifications pour correspondre au nombre de promos
   */
  updateNotificationsBasedOnPromos(): void {
    const promoCount = this.promos.length;
    console.log(`Mise à jour des notifications Mypromo: ${promoCount} promotions`);
    this.notificationService.setNotification(this.PROMO_APP_ID, promoCount);
  }
  
  /**
   * Charge les promotions depuis le stockage local
   */
  private loadPromos(): void {
    const storedPromos = localStorage.getItem(this.STORAGE_KEY);
    if (storedPromos) {
      try {
        this.promos = JSON.parse(storedPromos);
        this.promosSubject.next(this.promos);
      } catch (error) {
        console.error('Erreur lors du chargement des promotions:', error);
      }
    }
  }
  
  /**
   * Sauvegarde les promotions dans le stockage local
   */
  private savePromos(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.promos));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des promotions:', error);
    }
  }
}