import { Injectable } from '@angular/core';
import { PromoService } from './promo.service';
import { NotificationService } from './notification.service';
import { StorageService } from './storage.service';
import { AppDataService } from './app-data.service';

/**
 * Service d'initialisation qui se déclenche au démarrage de l'application
 */
@Injectable({
  providedIn: 'root'
})
export class InitService {
  constructor(
    private promoService: PromoService,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private appDataService: AppDataService
  ) {
    // Initialiser tout au démarrage
    this.initialize();
  }

  /**
   * Initialise les services au démarrage
   */
  private initialize(): void {
    console.log('Initialisation des services...');
    
    // Initialiser les notifications sur toutes les applications
    this.initializeAllAppNotifications();
    
    // S'assurer que les notifications de Mypromo sont à jour
    setTimeout(() => {
      this.promoService.updateNotificationsBasedOnPromos();
    }, 500);
  }

  /**
   * Initialise les notifications pour toutes les applications,
   * y compris celles qui ne sont pas sur la première page
   */
  private initializeAllAppNotifications(): void {
    // Récupérer toutes les applications
    const apps = this.storageService.getApps();
    
    if (apps.length === 0) {
      // Si aucune application n'est stockée, utiliser les applications par défaut
      this.appDataService.getDefaultApps().subscribe(defaultApps => {
        this.initializeNotificationsForApps(defaultApps);
      });
    } else {
      // Initialiser les notifications pour les applications existantes
      this.initializeNotificationsForApps(apps);
    }
  }
  
  /**
   * Initialise les notifications pour une liste d'applications
   */
  private initializeNotificationsForApps(apps: any[]): void {
    // Exclure l'application Mypromo car ses notifications sont gérées différemment
    const regularApps = apps.filter(app => app.id !== 'mypromo-app-id');
    
    // 70% des applications ont des notifications
    regularApps.forEach(app => {
      if (Math.random() < 0.7) {
        const notifCount = Math.floor(Math.random() * 10) + 1;
        console.log(`Initialisation notification pour ${app.name}: ${notifCount}`);
        this.notificationService.setNotification(app.id, notifCount);
      }
    });
  }
}