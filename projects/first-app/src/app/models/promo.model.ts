/**
 * Interface représentant une promotion dans l'application Mypromo
 */
export interface Promo {
    /**
     * Identifiant unique de la promotion
     */
    id: string;
    
    /**
     * Titre de la promotion
     */
    title: string;
  
    /**
     * Description ou valeur de la promotion (ex: "13€")
     */
    value: string;
  
    /**
     * Indique si cette promotion est sélectionnée
     */
    selected?: boolean;
  }