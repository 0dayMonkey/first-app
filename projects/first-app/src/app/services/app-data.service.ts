import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { App } from '../models/app.model';

/**
 * Service pour charger les données d'applications depuis un fichier externe
 */
@Injectable({
  providedIn: 'root'
})
export class AppDataService {
  
  constructor(private http: HttpClient) {}
  
  /**
   * Charge les applications par défaut depuis le fichier JSON
   * @returns Observable contenant un tableau d'applications
   */
  getDefaultApps(): Observable<App[]> {
    return this.http.get<App[]>('assets/data/default-apps.json')
      .pipe(
        tap(_ => console.log('Applications par défaut chargées')),
        catchError(this.handleError<App[]>('getDefaultApps', []))
      );
  }
  
  /**
   * Gère les erreurs de requête HTTP
   * @param operation - Nom de l'opération qui a échoué
   * @param result - Valeur optionnelle à retourner comme résultat observable
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} a échoué: ${error.message}`);
      
      // Si aucune donnée n'est disponible, on retourne un tableau vide
      return of(result as T);
    };
  }
}