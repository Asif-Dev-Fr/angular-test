import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { HomeService } from '../../services/home/home.service';
import { catchError, of, Subscription, tap } from 'rxjs';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private homeService = inject(HomeService);
  private formValuesSubscription: Subscription | null = null;

  @Input() updateTodo: Partial<Todo> = {};

  // fermer form (output vers le parent)
  // Définit un événement de sortie appelé 'formSubmitted'
  // Cet EventEmitter n'a pas besoin d'envoyer de données spécifiques (void)
  @Output() closeForm = new EventEmitter<void>();

  // Déclaration de l'Input pour recevoir la donnée du parent
  @Input() messageRecuDuParent: string = '';
  ngOnInit(): void {
    if (this.messageRecuDuParent) {
      console.log(
        'Message reçu du parent dans FormComponent (via Input) :',
        this.messageRecuDuParent,
        '!'
      );
    }
    if (this.updateTodo && this.updateTodo.text) {
      this.formGroup.patchValue({
        text: this.updateTodo.text,
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Vérifie si l'input 'updateTodo' a changé
    if (changes['updateTodo'] && changes['updateTodo'].currentValue) {
      const newTodo = changes['updateTodo'].currentValue as Partial<Todo>;
      // Si la valeur de 'text' existe, met à jour le formulaire
      if (newTodo.text) {
        this.formGroup.patchValue({
          text: newTodo.text,
        });
      } else {
        // Si updateTodo est vide ou sans texte, réinitialise le formulaire
        this.formGroup.reset();
      }
    }
  }

  formGroup: any = this.fb.group({
    text: ['', [Validators.required]],
  });

  submit(event: Event) {
    event.preventDefault();
    if (this.formGroup.valid) {
      const todoData = {
        text: this.formGroup.value.text!,
        // userId sera géré par le backend ou via l'authentification plus tard
      };

      if (this.updateTodo && this.updateTodo.id) {
        // C'est une mise à jour
        const updatedTodo: Partial<Todo> = {
          ...(this.updateTodo as Todo), // Conserve l'ID et les autres propriétés de l'original
          ...todoData, // Applique le texte du formulaire
        };
        this.homeService
          .update(updatedTodo)
          .pipe(
            tap((response) => {
              console.log('Tâche mise à jour avec succès !', response);
              this.formGroup.reset();
              this.closeForm.emit();
            }),
            catchError((error) => {
              console.error(
                'Erreur lors de la mise à jour de la tâche :',
                error
              );
              // Afficher un message d'erreur à l'utilisateur
              return of(null);
            })
          )
          .subscribe();
      } else {
        // C'est un ajout
        this.homeService
          .add(todoData)
          .pipe(
            tap((response) => {
              console.log('Nouvelle tâche ajoutée avec succès !', response);
              this.formGroup.reset();
              this.closeForm.emit();
            }),
            catchError((error) => {
              console.error("Erreur lors de l'ajout de la tâche :", error);
              // Afficher un message d'erreur à l'utilisateur
              return of(null);
            })
          )
          .subscribe();
      }
    } else {
      console.log(
        'Formulaire invalide. Veuillez remplir tous les champs requis.'
      );
      this.formGroup.markAllAsTouched();
    }
  }

  isFieldValid(fieldName: string) {
    const formControl = this.formGroup.get(fieldName);
    return formControl?.invalid && (formControl?.dirty || formControl?.touched);
  }
}
