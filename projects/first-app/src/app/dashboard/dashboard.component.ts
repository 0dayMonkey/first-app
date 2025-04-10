import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// un widget c'est quoi...
interface Widget {
  id: number; 
  name: string;
  url: SafeResourceUrl;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  // les trucs
  widgets: Widget[] = [];
  currentPage = 0;
  widgetsPerPage = 3; // 3 par page comme tu voulais
  
  // calcul pages
  get totalPages(): number {
    return Math.ceil(this.widgets.length / this.widgetsPerPage);
  }
  
  // widgets visibles
  get visibleWidgets(): Widget[] {
    const start = this.currentPage * this.widgetsPerPage;
    return this.widgets.slice(start, start + this.widgetsPerPage);
  }

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    // qqs widgets test
    this.widgets = [
      { 
        id: 1, 
        name: 'Google', 
        url: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com')
      },
      { 
        id: 2, 
        name: 'YouTube', 
        url: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com')
      },
      { 
        id: 3, 
        name: 'Twitter', 
        url: this.sanitizer.bypassSecurityTrustResourceUrl('https://twitter.com')
      },
      { 
        id: 4, 
        name: 'Facebook', 
        url: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.facebook.com')
      },
      { 
        id: 5, 
        name: 'Reddit', 
        url: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.reddit.com')
      }
    ];
  }

  // aller à droite
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  // aller à gauche
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
}