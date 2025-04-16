import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { App } from '../models/app.model';

@Component({
  selector: 'app-add-widget-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './add-widget-dialog.component.html',
  styleUrls: ['./add-widget-dialog.component.scss']
})
export class AddWidgetDialogComponent {
  newApp: App = {
    name: '',
    url: '',
    iconUrl: ''
  };

  constructor(public dialogRef: MatDialogRef<AddWidgetDialogComponent>) {}

  /**
   * Fermer le dialogue sans sauvegarder
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Valider et ajouter la nouvelle application
   */
  onAdd(): void {
    if (this.newApp.name && this.newApp.url) {
      this.dialogRef.close(this.newApp);
    }
  }
}