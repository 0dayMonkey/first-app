/**
 * Interface représentant une application dans le dashboard
 */
export interface App {
  /**
   * Identifiant unique de l'application
   */
  id?: string;
  
  /**
   * Nom de l'application affiché sous l'icône
   */
  name: string;
  
  /**
   * URL de l'application à ouvrir dans l'iframe
   */
  url: string;
  
  /**
   * URL de l'icône de l'application (optionnel)
   */
  iconUrl?: string;
  
  /**
   * Nombre de notifications pour cette application
   */
  notifications?: number;
}