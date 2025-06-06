// src/app/components/auth/register/register.component.ts
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common'; // Pour NgIf, NgFor, etc.
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field'; // Pour mat-form-field
import { AuthService } from '../../../services/auth/auth.service';
import { UserRegister } from '../../../models/auth.model';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs'; // Pour gérer les erreurs

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup; // Utilisez ! pour dire que c'est initialisé dans ngOnInit
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        username: ['', Validators.required, Validators.minLength(3)],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(20),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    ); // Ajoutez le validateur personnalisé
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      // Set error on confirmPassword control
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Remove error if they match
      if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
      return null;
    }
  }

  // Méthode pour vérifier la validité d'un champ
  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  // Méthode pour soumettre le formulaire
  onSubmit(): void {
    this.errorMessage = null; // Réinitialise les messages
    this.successMessage = null;

    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value;
      const userData: UserRegister = { username, email, password };

      this.authService
        .register(userData)
        .pipe(
          catchError((error) => {
            this.errorMessage =
              error.message ||
              "Une erreur inconnue est survenue lors de l'inscription.";
            console.error("Erreur d'inscription:", error);
            return of(null); // Permet à l'Observable de se terminer proprement
          })
        )
        .subscribe((response) => {
          if (response) {
            this.successMessage = `Compte créé pour ${response.username} (${response.email}) ! Vous pouvez maintenant vous connecter.`;
            this.registerForm.reset(); // Réinitialise le formulaire après succès
            // Plus tard: Redirection vers la page de login ou d'accueil
          }
        });
    } else {
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire.';
      this.registerForm.markAllAsTouched(); // Marque tous les champs comme touchés pour afficher les erreurs
    }
  }
}
