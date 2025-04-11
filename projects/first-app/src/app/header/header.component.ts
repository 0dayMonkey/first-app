import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLandingPage = false;
  isMypromoPage = false;
  pageTitle = 'Dashboard';
  
  constructor(
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLandingPage = event.url.includes('/landingPage');
      this.isMypromoPage = event.url.includes('/mypromo');
      
      // Déterminer le titre en fonction de la page
      if (this.isLandingPage) {
        this.pageTitle = 'Application';
      } else if (this.isMypromoPage) {
        this.pageTitle = 'Mypromo';
      } else {
        this.pageTitle = 'Dashboard';
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    if (this.isLandingPage || this.isMypromoPage) {
      this.router.navigate(['/']);
    } else {
      this.location.back();
    }
  }
}