import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';

/**
 * Service de gestion des notifications pour les applications
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private notificationsSubject = new BehaviorSubject<{ [key: string]: number }>({});
  private updateInterval: Subscription;
  private readonly PROMO_APP_ID = 'mypromo-app-id';
  
  constructor() {
    // Mise à jour périodique des notifications toutes les 5 secondes
    this.updateInterval = interval(5000).subscribe(() => {
      this.updateRandomNotifications();
    });
    
    // Initialisation avec des valeurs par défaut
    this.updateRandomNotifications();
  }
  
  ngOnDestroy(): void {
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
    }
  }
  
  /**
   * Récupère le flux d'observables des notifications
   */
  getNotifications(): Observable<{ [key: string]: number }> {
    return this.notificationsSubject.asObservable();
  }
  
  /**
   * Récupère la valeur actuelle des notifications
   */
  getNotificationsValue(): { [key: string]: number } {
    return this.notificationsSubject.getValue();
  }
  
  /**
   * Met à jour les notifications pour une application spécifique
   * @param appId Identifiant de l'application
   * @param count Nombre de notifications
   */
  setNotification(appId: string, count: number): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next({
      ...currentNotifications,
      [appId]: count
    });
    
    // Log pour le débogage
    console.log(`Notification mise à jour - App: ${appId}, Count: ${count}`);
  }
  
  /**
   * Réinitialise les notifications pour une application spécifique
   * @param appId Identifiant de l'application
   */
  clearNotification(appId: string): void {
    this.setNotification(appId, 0);
  }
  
  /**
   * Génère des notifications aléatoires pour simuler l'activité
   */
  private updateRandomNotifications(): void {
    const currentNotifications = { ...this.notificationsSubject.value };
    
    // Liste des IDs des applications populaires
    const popularApps = [
      '2', // YouTube
      '1', // Google
      '3', // Facebook
      '4', // Twitter
      '5', // Instagram
      '6', // WhatsApp
      '7', // Snapchat
      '8', // LinkedIn
      '9', // Reddit
      '10', // TikTok
      '11', // Discord
      '12', // Spotify
      '13', // Netflix
      '14', // Steam
      '15', // Amazon
      '16', // Gmail
      '17', // Google Drive
      '18', // Dropbox
      '19', // OneDrive
      '20' // Evernote
    ];
    
    // 15% de chance d'ajouter une notification à une application aléatoire
    if (Math.random() < 0.15) {
      const randomAppId = popularApps[Math.floor(Math.random() * popularApps.length)];
      
      // Ne pas modifier les notifications de Mypromo
      if (randomAppId !== this.PROMO_APP_ID) {
        const currentCount = currentNotifications[randomAppId] || 0;
        const increment = Math.floor(Math.random() * 3) + 1;
        
        currentNotifications[randomAppId] = Math.min(currentCount + increment, 99);
      }
    }
    
    this.notificationsSubject.next(currentNotifications);
  }
}