import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Promo } from '../models/promo.model';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { ConfigService } from './config.service';

/**
 * Service de gestion des promotions
 */
@Injectable({
  providedIn: 'root'
})
export class PromoService implements OnInit {
  private promos: Promo[] = [];
  private promosSubject = new BehaviorSubject<Promo[]>([]);
  
  // Paramètres configurables
  private readonly PROMO_APP_ID: string;
  private readonly STORAGE_KEY: string;
  private readonly VOUCHER_CODE_PATTERN: RegExp;
  private readonly RESET_STORAGE_ON_INIT: boolean;
  private readonly USE_DEFAULT_PROMOS_ONLY: boolean;
  private readonly DEFAULT_PROMOTIONS: Promo[];
  private readonly ENABLE_LOGS: boolean;
  
  constructor(
    private storageService: StorageService,
    private notificationService: NotificationService,
    private configService: ConfigService
  ) {
    // Charger les paramètres depuis la configuration
    this.PROMO_APP_ID = this.configService.getValue('dashboard.MYPROMO_APP_ID', 'mypromo-app-id');
    this.STORAGE_KEY = this.configService.getValue('storage.PROMOS_STORAGE_KEY', 'mypromo_promos');
    this.RESET_STORAGE_ON_INIT = this.configService.getValue('storage.RESET_STORAGE_ON_INIT', false);
    this.USE_DEFAULT_PROMOS_ONLY = this.configService.getValue('storage.USE_DEFAULT_PROMOS_ONLY', false);
    this.DEFAULT_PROMOTIONS = this.configService.getValue('promotions.DEFAULT_PROMOTIONS', []);
    this.ENABLE_LOGS = this.configService.getValue('features.ENABLE_CONSOLE_LOGS', true);
    
    // Créer le RegExp pour la validation des codes
    const pattern = this.configService.getValue('promotions.VOUCHER_CODE_PATTERN', '^\\w{2}-\\w{4}-\\w{4}-\\w{4}-\\w{4}$');
    try {
      this.VOUCHER_CODE_PATTERN = new RegExp(pattern);
    } catch (error) {
      this.logError('Format de RegExp invalide dans la configuration:', error);
      this.VOUCHER_CODE_PATTERN = /^\w{2}-\w{4}-\w{4}-\w{4}-\w{4}$/;
    }
    
    this.log(`PromoService initialisé avec: appID=${this.PROMO_APP_ID}, stockage=${this.STORAGE_KEY}, réinitialiser=${this.RESET_STORAGE_ON_INIT}, useDefault=${this.USE_DEFAULT_PROMOS_ONLY}`);
    
    // Réinitialiser le stockage si configuré
    if (this.RESET_STORAGE_ON_INIT) {
      localStorage.removeItem(this.STORAGE_KEY);
      this.log('Stockage des promotions réinitialisé');
    }
    
    // Chargement des promotions
    if (this.USE_DEFAULT_PROMOS_ONLY) {
      // Ignorer le stockage local et utiliser uniquement les promotions par défaut
      this.initializeDefaultPromos();
    } else {
      // Comportement normal: charger depuis le stockage, puis utiliser les défauts si vide
      this.loadPromos();
      if (this.promos.length === 0) {
        this.initializeDefaultPromos();
      }
    }
    
    // Mettre à jour les notifications pour correspondre au nombre de promos
    this.updateNotificationsBasedOnPromos();
  }
  
  ngOnInit(): void {
    // S'assurer que les notifications sont mises à jour dès le démarrage
    this.updateNotificationsBasedOnPromos();
  }
  
  /**
   * Récupère la liste des promotions
   */
  getPromos(): Observable<Promo[]> {
    return this.promosSubject.asObservable();
  }
  
  /**
   * Récupère la liste des promotions de manière synchrone (pour débogage)
   */
  getPromosSync(): Promo[] {
    return [...this.promos];
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
    this.promosSubject.next([...this.promos]);
  }
  
  /**
   * Vérifie si un code voucher est valide
   */
  validateVoucherCode(code: string): boolean {
    return this.VOUCHER_CODE_PATTERN.test(code);
  }
  
  /**
   * Supprime une promotion après utilisation
   */
  removePromo(id: string): void {
    this.log(`Suppression de la promotion avec l'ID: ${id}`);
    
    // Filtrer les promotions pour supprimer celle avec l'ID correspondant
    const initialCount = this.promos.length;
    this.promos = this.promos.filter(promo => promo.id !== id);
    
    // Vérifier que la suppression a fonctionné
    if (initialCount === this.promos.length) {
      this.logWarning(`Échec de la suppression: promo avec ID ${id} non trouvée`);
    }
    
    // S'assurer que le stockage local est mis à jour
    this.savePromos();
    
    // Mise à jour du BehaviorSubject pour notifier les abonnés
    this.promosSubject.next([...this.promos]);
    
    // Mettre à jour les notifications
    this.updateNotificationsBasedOnPromos();
    
    this.log(`Nombre de promotions restantes: ${this.promos.length}`);
  }
  
  /**
   * Initialise les promotions par défaut
   */
  private initializeDefaultPromos(): void {
    // Utiliser les promotions configurées dans le fichier JSON
    if (this.DEFAULT_PROMOTIONS && this.DEFAULT_PROMOTIONS.length > 0) {
      this.promos = [...this.DEFAULT_PROMOTIONS];
      this.log(`Initialisation avec ${this.promos.length} promotions par défaut depuis la configuration`);
    } else {
      // Fallback si la configuration est vide
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
          title: 'Promotion de fin de vacances pour nos membres fidèles',
          value: '25 crédits regular',
          selected: false
        }
      ];
      this.log('Initialisation avec promotions par défaut (fallback)');
    }
    
    this.savePromos();
    this.promosSubject.next([...this.promos]);
  }
  
  /**
   * Met à jour les notifications pour correspondre au nombre de promos
   */
  updateNotificationsBasedOnPromos(): void {
    const promoCount = this.promos.length;
    this.log(`Mise à jour des notifications Mypromo: ${promoCount} promotions`);
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
        this.log(`Chargement de ${this.promos.length} promotions depuis le stockage local`);
        this.promosSubject.next([...this.promos]);
      } catch (error) {
        this.logError('Erreur lors du chargement des promotions:', error);
      }
    } else {
      this.log('Aucune promotion trouvée dans le stockage local');
    }
  }
  
  /**
   * Sauvegarde les promotions dans le stockage local
   */
  private savePromos(): void {
    try {
      // Log pour déboguer
      this.log(`Sauvegarde des promotions: ${this.promos.length} promos`);
      
      // Convertir les promos en JSON et sauvegarder dans localStorage
      const promosJSON = JSON.stringify(this.promos);
      localStorage.setItem(this.STORAGE_KEY, promosJSON);
      
      // Vérifier que la sauvegarde a fonctionné
      const savedPromos = localStorage.getItem(this.STORAGE_KEY);
      if (savedPromos) {
        const parsedPromos = JSON.parse(savedPromos);
        this.log(`Vérification après sauvegarde: ${parsedPromos.length} promos`);
      } else {
        this.logError('Erreur: La sauvegarde des promotions a échoué');
      }
    } catch (error) {
      this.logError('Erreur lors de la sauvegarde des promotions:', error);
    }
  }
  
  /**
   * Utilitaire pour ajouter une promotion manuellement (par exemple depuis la console)
   */
  addPromotion(title: string, value: string): void {
    const newPromo: Promo = {
      id: Date.now().toString(),
      title,
      value,
      selected: false
    };
    
    this.promos.push(newPromo);
    this.savePromos();
    this.promosSubject.next([...this.promos]);
    this.updateNotificationsBasedOnPromos();
    
    this.log(`Promotion "${title}" ajoutée avec succès`);
  }
  
  /**
   * Méthodes de logging conditionnelles
   */
  private log(message: string): void {
    if (this.ENABLE_LOGS) {
      console.log(`[PromoService] ${message}`);
    }
  }
  
  private logWarning(message: string): void {
    if (this.ENABLE_LOGS) {
      console.warn(`[PromoService] ${message}`);
    }
  }
  
  private logError(message: string, error?: any): void {
    if (this.ENABLE_LOGS) {
      console.error(`[PromoService] ${message}`, error);
    }
  }
}