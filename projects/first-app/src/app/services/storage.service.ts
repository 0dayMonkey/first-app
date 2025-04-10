import { Injectable } from '@angular/core';

// truc pour stocker
interface WidgetStorage {
  id: number;
  name: string;
  appUrlStr: string; // obligé de stocker en string
  landingUrlStr: string;
  position: number;
  iconUrl?: string;
  // pas besoin de stocker les notifications, elles sont générées dynamiquement
}
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  private STORAGE_KEY = 'dashboard_widgets';
  
  constructor() { }
  
  // récup les trucs
  getWidgets(): WidgetStorage[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    
    if (!data) {
      return []; // vide
    }
    
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('oups pb localStorage:', e);
      return [];
    }
  }
  
  // save des widgets
  saveWidgets(widgets: any[]): void {
    try {
      // safeurl marche pas faut convertir
      const w2save = widgets.map(w => ({
        id: w.id,
        name: w.name,
        appUrlStr: w.appUrl.toString(),
        landingUrlStr: w.landingUrl.toString(), 
        position: w.position,
        iconUrl: w.iconUrl
        // pas besoin de sauvegarder notificationCount, c'est généré dynamiquement
      }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(w2save));
    } catch (e) {
      console.error('pb save:', e);
    }
  }
}