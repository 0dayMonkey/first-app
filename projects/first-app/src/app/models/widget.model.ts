import { SafeResourceUrl } from '@angular/platform-browser';

// pour stocker des widgets style iphone
export interface Widget {
  id: number; // sans ? pcq ca fait des erreurs
  name: string;
  appUrl: SafeResourceUrl; // pour liframe small
  landingUrl: SafeResourceUrl; // pour lapp
  position: number;
  iconUrl?: string; // optionel
}