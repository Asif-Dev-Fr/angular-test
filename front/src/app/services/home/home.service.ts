// src/app/services/home/home.service.ts
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Todo } from '../../models/todo.model';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // <<< Importe HttpClient
import { Observable } from 'rxjs'; // Pour gérer les requêtes asynchrones

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  // La liste de tâches est un tableau simple
  todoList: Todo[] = [];

  // Injection de PLATFORM_ID pour gérer l'exécution côté client/serveur
  private platformId: Object = inject(PLATFORM_ID);
  private http = inject(HttpClient); // <<< Injecte HttpClient

  // backend url
  private apiUrl = 'http://localhost:3000/api/todos';

  constructor() {
    // Charge les données depuis localStorage uniquement si l'application s'exécute dans un navigateur
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  // Charge la liste de tâches depuis localStorage
  private load(): void {
    const todo = localStorage.getItem('todoList');
    if (todo) {
      try {
        // Parse les données et assure la conversion des dates et la création d'instances Todo
        this.todoList = JSON.parse(todo).map((todoJson: any) => {
          todoJson.createAt = new Date(todoJson.createAt); // Convertit la chaîne en objet Date
          return Object.assign(new Todo(), todoJson); // Crée une instance de Todo
        });
      } catch (e) {
        console.error('Erreur lors du parsing des données du localStorage', e);
        this.todoList = []; // Réinitialise la liste en cas d'erreur de parsing
      }
    }
  }

  // Sauvegarde la liste de tâches actuelle dans localStorage
  private save(): void {
    // Sauvegarde uniquement si l'application s'exécute dans un navigateur
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('todoList', JSON.stringify(this.todoList));
    }
  }

  /**
   * Retourne une copie de la liste de toutes les tâches.
   * La copie est importante pour éviter les mutations directes de l'état interne.
   * @returns Un tableau de copies de tâches.
   */
  getAll(): Observable<Todo[]> {
    console.log('Fetching all todos from API...');
    return this.http.get<Todo[]>(this.apiUrl);
  }

  /**
   * Retourne une copie d'une tâche spécifique par son ID.
   * @param id L'ID de la tâche à récupérer.
   * @returns Une copie de la tâche ou undefined si non trouvée.
   */
  get(id: number): Todo | undefined {
    const todo: Todo | undefined = this.todoList.find(
      (t: Todo): boolean => t.id === id
    );
    return todo ? todo.copy() : undefined;
  }

  /**
   * Ajoute une nouvelle tâche à la liste.
   * @param newTodo L'objet tâche à ajouter (sans ID ni date de création).
   */
  add(newTodoData: Partial<Todo>): Observable<Todo> {
    console.log('Adding new todo via API:', newTodoData);
    // Le backend génère l'ID, createAt, updatedAt, etc.
    return this.http.post<Todo>(this.apiUrl, newTodoData);
  }

  /**
   * Supprime une tâche de la liste par son ID.
   * @param id L'ID de la tâche à supprimer.
   */
  delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Deleting todo via API, ID:', id);
    return this.http.delete<void>(url);
  }

  /**
   * Met à jour une tâche existante dans la liste.
   * @param updatedTodo La tâche avec les propriétés mises à jour.
   */
  update(updatedTodo: Partial<Todo>): Observable<Todo> {
    // L'ID doit être dans l'URL pour l'opération PUT/PATCH standard REST
    const url = `${this.apiUrl}/${updatedTodo.id}`;
    console.log('Updating todo via API:', updatedTodo);
    // Envoyer toutes les propriétés nécessaires pour la mise à jour (texte)
    return this.http.put<Todo>(url, { text: updatedTodo.text });
  }
}
