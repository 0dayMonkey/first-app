import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { App } from '../models/app.model';

@Component({
  selector: 'app-edit-app-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './edit-app-dialog.component.html',
  styleUrls: ['./edit-app-dialog.component.scss']
})
export class EditAppDialogComponent {
  // Utiliser une copie de l'application pour éviter de modifier l'original
  // avant confirmation
  editedApp: App;

  constructor(
    public dialogRef: MatDialogRef<EditAppDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { app: App }
  ) {
    this.editedApp = { ...data.app };
  }

  /**
   * Fermer le dialogue sans sauvegarder
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Valider les modifications et fermer le dialogue
   */
  onSave(): void {
    // Vérifier que les champs obligatoires sont remplis
    if (this.editedApp.name && this.editedApp.url) {
      this.dialogRef.close(this.editedApp);
    }
  }
}