import { Component } from '@angular/core';
import { FirstLibComponent } from 'first-lib';



@Component({
  selector: 'app-root',
  imports: [FirstLibComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'first-app';
}
