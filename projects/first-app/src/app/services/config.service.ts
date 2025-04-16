import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Service de gestion de la configuration de l'application
 * Permet de charger et d'accéder aux paramètres depuis un fichier JSON
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configUrl = 'assets/config/app-config.json';
  private config: any = null;
  private configSubject = new BehaviorSubject<any>(null);
  private isLoaded = false;
  private reloadInterval = 10000; // 10 secondes par défaut
  private reloadTimer: any = null;

  constructor(private http: HttpClient) {
    this.loadConfig();
    
    // Démarrer le rechargement périodique de la configuration
    this.reloadTimer = setInterval(() => {
      this.reloadConfig();
    }, this.reloadInterval);
  }

  /**
   * Charge la configuration depuis le fichier JSON
   */
  private loadConfig(): void {
    this.http.get<any>(this.configUrl)
      .pipe(
        tap(config => {
          console.log('Configuration chargée:', config);
          this.config = config;
          this.configSubject.next(config);
          this.isLoaded = true;
          
          // Mettre à jour l'intervalle de rechargement si configuré
          if (config && config.features && config.features.CONFIG_RELOAD_INTERVAL) {
            const newInterval = config.features.CONFIG_RELOAD_INTERVAL;
            if (newInterval !== this.reloadInterval) {
              this.reloadInterval = newInterval;
              clearInterval(this.reloadTimer);
              this.reloadTimer = setInterval(() => {
                this.reloadConfig();
              }, this.reloadInterval);
              console.log(`Intervalle de rechargement mis à jour: ${this.reloadInterval}ms`);
            }
          }
        }),
        catchError(error => {
          console.error('Erreur lors du chargement de la configuration:', error);
          // Utiliser une configuration par défaut en cas d'échec
          this.configSubject.next(this.getDefaultConfig());
          this.isLoaded = true;
          return of(this.getDefaultConfig());
        })
      )
      .subscribe();
  }
  
  /**
   * Recharge la configuration depuis le fichier JSON
   * Cette méthode est appelée périodiquement et peut être appelée manuellement
   */
  reloadConfig(): void {
    console.log('Rechargement de la configuration...');
    this.http.get<any>(this.configUrl)
      .pipe(
        tap(config => {
          // Vérifier si la configuration a changé
          const oldConfig = JSON.stringify(this.config);
          const newConfig = JSON.stringify(config);
          
          if (oldConfig !== newConfig) {
            console.log('Nouvelle configuration détectée et appliquée');
            this.config = config;
            this.configSubject.next(config);
          } else {
            console.log('Configuration inchangée');
          }
        }),
        catchError(error => {
          console.error('Erreur lors du rechargement de la configuration:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Retourne un observable de la configuration
   */
  getConfig(): Observable<any> {
    return this.configSubject.asObservable();
  }

  /**
   * Récupère la configuration de manière synchrone
   * Attention: ne pas utiliser avant que la configuration soit chargée
   */
  getConfigSync(): any {
    if (!this.isLoaded) {
      console.warn('La configuration n\'est pas encore chargée, retour des valeurs par défaut');
      return this.getDefaultConfig();
    }
    return this.config;
  }

  /**
   * Vérifie si la configuration est chargée
   */
  isConfigLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Retourne une valeur spécifique de la configuration
   * @param path Chemin dans l'objet de configuration (ex: 'animations.TITLE_MARQUEE_SPEED')
   * @param defaultValue Valeur par défaut si le chemin n'est pas trouvé
   */
  getValue(path: string, defaultValue: any = null): any {
    if (!this.isLoaded) {
      console.warn(`La configuration n'est pas encore chargée, retour de la valeur par défaut pour ${path}`);
      return defaultValue;
    }

    const parts = path.split('.');
    let result = this.config;

    for (const part of parts) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[part];
      if (result === undefined) {
        return defaultValue;
      }
    }

    return result !== undefined ? result : defaultValue;
  }

  /**
   * Configuration par défaut en cas d'échec de chargement
   */
  private getDefaultConfig(): any {
    return {
      animations: {
        TITLE_MARQUEE_SPEED: 10,
        TITLE_MARQUEE_DELAY: 2,
        TITLE_MARQUEE_PAUSE: 2,
        TITLE_MIN_CHARS: 20,
        TITLE_CONTAINER_WIDTH: 180,
        ANIMATION_REDEEM: true,
        VALIDATION_ANIMATION_DURATION: 300
      },
      notifications: {
        UPDATE_INTERVAL: 5000,
        RANDOM_NOTIFICATION_CHANCE: 0.15
      },
      promotions: {
        VOUCHER_CODE_FORMAT: "XX-XXXX-XXXX-XXXX-XXXX",
        VOUCHER_CODE_PATTERN: "^\\w{2}-\\w{4}-\\w{4}-\\w{4}-\\w{4}$",
        PROMO_RESULT_COUNTDOWN: 30
      },
      dashboard: {
        PAGE_SIZE: 5,
        STORAGE_KEY: "dashboard_apps",
        MYPROMO_APP_ID: "mypromo-app-id"
      },
      storage: {
        PROMOS_STORAGE_KEY: "mypromo_promos",
        RESET_STORAGE_ON_INIT: false,
        USE_DEFAULT_PROMOS_ONLY: true
      },
      features: {
        ENABLE_CONSOLE_LOGS: true,
        CONFIG_RELOAD_INTERVAL: 10000
      }
    };
  }
}