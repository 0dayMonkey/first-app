import { NgModule } from '@angular/core'; 
import { RouterModule, Routes } from '@angular/router'; 
import { HomeComponent } from './pages/home/home.component'; 
 
const routes: Routes = [ 
  { path: '', component: HomeComponent }, 
  // Routes futures pour les landing pages 
  // { path: 'app/:id', component: AppLandingComponent }, 
  { path: '**', redirectTo: '' } 
]; 
 
@NgModule({ 
  imports: [RouterModule.forRoot(routes)], 
  exports: [RouterModule] 
}) 
export class AppRoutingModule { } 
