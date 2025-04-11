import { Injectable } from '@angular/core';
import { App } from '../models/app.model';

/**
 * Service de gestion du stockage local des applications
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'dashboard_apps';
  
  constructor() {}
  
  /**
   * Récupère la liste des applications depuis le stockage local
   */
  getApps(): App[] {
    const storedApps = localStorage.getItem(this.STORAGE_KEY);
    if (storedApps) {
      try {
        return JSON.parse(storedApps);
      } catch (error) {
        console.error('Erreur lors de la récupération des applications:', error);
        return [];
      }
    }
    return [];
  }
  
  /**
   * Sauvegarde la liste des applications dans le stockage local
   * @param apps Liste des applications à sauvegarder
   */
  saveApps(apps: App[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(apps));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des applications:', error);
    }
  }
  
  /**
   * Supprime toutes les applications du stockage local
   */
  clearApps(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}