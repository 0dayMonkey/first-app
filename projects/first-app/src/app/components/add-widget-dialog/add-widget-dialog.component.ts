import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-widget-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  templateUrl: './add-widget-dialog.component.html',
  styleUrls: ['./add-widget-dialog.component.scss']
})
export class AddWidgetDialogComponent {
  // les var
  name: string = '';
  appUrl: string = '';
  iconUrl: string = '';
  
  // check si valid
  isValid(): boolean {
    return this.name.trim() !== '' && this.appUrl.trim() !== '';
  }
  
  constructor(public dialogRef: MatDialogRef<AddWidgetDialogComponent>) {}
  
  // annuler
  cancel(): void {
    this.dialogRef.close();
  }
  
  // ajouter
  add(): void {
    if (this.isValid()) {
      // check urls
      let url = this.appUrl;
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      
      let iconurl = this.iconUrl;
      if (iconurl && !iconurl.startsWith('http')) {
        iconurl = 'https://' + iconurl;
      }
      
      // meme url pcq jmen fiche
      const landingUrl = url;
      
      this.dialogRef.close({
        name: this.name,
        appUrl: url,
        landingUrl: landingUrl,
        iconUrl: iconurl
      });
    }
  }
}