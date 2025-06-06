import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA, // Pour recevoir les données passées à la modale
  MatDialogRef, // Pour pouvoir fermer la modale et retourner un résultat
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions, // Pour les actions (boutons) de la modale
} from '@angular/material/dialog';
import { Todo } from '../../models/todo.model'; // Assurez-vous que le chemin est correct

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions, // Importez MatDialogActions
    MatButtonModule,
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  // Injecte MatDialogRef pour fermer la modale et MAT_DIALOG_DATA pour recevoir la tâche
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>, // Pour fermer la modale
    @Inject(MAT_DIALOG_DATA) public data: { todo: Todo } // Pour recevoir la tâche à supprimer
  ) {
    console.log('Tâche reçue dans la modale :', this.data.todo);
  }

  onConfirm(): void {
    this.dialogRef.close(true); // Ferme la modale et retourne 'true' (confirmation)
  }

  onCancel(): void {
    this.dialogRef.close(false); // Ferme la modale et retourne 'false' (annulation)
  }
}
