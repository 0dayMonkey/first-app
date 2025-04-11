import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { MypromoComponent } from './mypromo/mypromo.component';
import { PinCodeComponent } from './pin-code/pin-code.component';
import { PromoResultComponent } from './promo-result/promo-result.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'landingPage',
    component: LandingPageComponent
  },
  {
    path: 'mypromo',
    component: MypromoComponent
  },
  {
    path: 'pin-code',
    component: PinCodeComponent
  },
  {
    path: 'promo-result',
    component: PromoResultComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];