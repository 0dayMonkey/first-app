import { Component, OnInit } from '@angular/core'; 
 
@Component({ 
  selector: 'app-home', 
  templateUrl: './home.component.html', 
  styleUrls: ['./home.component.scss'] 
}) 
export class HomeComponent implements OnInit { 
  title = 'êcran d\'accueil'; 
Commande ECHO dÇsactivÇe.
  constructor() { } 
 
  ngOnInit(): void { 
    // Initialisation du composant 
  } 
} 
