import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs'; // of et throwError pour la simulation
import { delay, tap } from 'rxjs/operators';
import { UserRegister, AuthResponse } from '../../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  // L'URL de base pour votre API d'authentification (à ajuster plus tard)
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor() {}

  /**
   * Simule la création de compte. Plus tard, fera une requête HTTP POST au backend.
   * @param userData Les données d'inscription (username, email, password).
   * @returns Un Observable de la réponse d'authentification ou d'une erreur.
   */
  register(userData: UserRegister): Observable<AuthResponse> {
    console.log("Tentative d'inscription avec les données :", userData);

    // --- POUR LE MOMENT : Simulation côté Front-end ---
    // Simule une réponse du serveur après un délai
    if (userData.email === 'test@example.com') {
      // Simule un échec (par exemple, email déjà utilisé)
      return throwError(() => new Error('Cet email est déjà enregistré.'));
    } else {
      // Simule un succès
      const mockResponse: AuthResponse = {
        id: Math.floor(Math.random() * 1000) + 100,
        username: userData.username,
        email: userData.email,
        // Pas de token pour l'instant
      };
      return of(mockResponse).pipe(
        delay(1000), // Simule un délai réseau
        tap(() => console.log('Inscription simulée réussie !', mockResponse))
      );
    }

    // --- PLUS TARD : Vraie requête HTTP (décommenter et remplacer la simulation) ---
    // return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
    //   tap(response => console.log('Inscription réussie !', response))
    // );
  }

  // --- PLUS TARD : Ajoutez une méthode pour la connexion (login) ---
  // login(credentials: UserLogin): Observable<AuthResponse> {
  //   return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  // }
}
