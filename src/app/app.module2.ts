import { NgModule } from '@angular/core'; 
import { BrowserModule } from '@angular/platform-browser'; 
import { RouterModule } from '@angular/router'; 
 
import { AppComponent } from './app.component'; 
import { HomeComponent } from './pages/home/home.component'; 
import { WidgetGridComponent } from './components/widget-grid/widget-grid.component'; 
import { WidgetItemComponent } from './components/widget-item/widget-item.component'; 
import { SafeUrlPipe } from './pipes/safe-url.pipe'; 
 
@NgModule({ 
  declarations: [ 
    AppComponent, 
    HomeComponent, 
    WidgetGridComponent, 
    WidgetItemComponent, 
    SafeUrlPipe 
  ], 
  imports: [ 
    BrowserModule, 
    RouterModule.forRoot([ 
      { path: '', component: HomeComponent }, 
      { path: '**', redirectTo: '' } 
    ]) 
  ], 
  providers: [], 
  bootstrap: [AppComponent] 
}) 
export class AppModule { } 
