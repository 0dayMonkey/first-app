import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Service de gestion des notifications pour les applications
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private notificationsSubject = new BehaviorSubject<{ [key: string]: number }>({});
  private updateInterval: Subscription;
  
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
    
    // Pour chaque application existante, mettre à jour aléatoirement
    Object.keys(currentNotifications).forEach(appId => {
      // 30% de chance d'augmenter le nombre de notifications
      if (Math.random() < 0.3) {
        currentNotifications[appId] = Math.min(
          (currentNotifications[appId] || 0) + Math.floor(Math.random() * 3) + 1,
          99
        );
      }
    });
    
    this.notificationsSubject.next(currentNotifications);
  }
}