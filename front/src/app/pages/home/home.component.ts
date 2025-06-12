import { Component, inject, Input, OnInit } from '@angular/core';
import { FormComponent } from '../form/form.component';
import { HomeService } from '../../services/home/home.service';
import { Todo } from '../../models/todo.model';
import {
  MatListModule,
  MatList,
  MatListItem,
  MatListItemTitle,
  MatListItemLine,
  MatListItemIcon,
} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { MatDialog } from '@angular/material/dialog';
import { UsersComponent } from '../users/users.component';
import { UserListAngularStyleComponent } from '../user-list-angular-style/user-list-angular-style.component';

interface FakeUser {
  id: number;
  userName: string;
  email: string;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormComponent,
    MatListModule,
    MatList,
    MatListItem,
    MatIconModule,
    MatListItemTitle,
    MatListItemLine,
    MatListItemIcon,
    UsersComponent,
    UserListAngularStyleComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  // inject useContext
  private homeService = inject(HomeService);
  private dialog: MatDialog = inject(MatDialog);
  // Observable = useState + useEffect
  todos$: Observable<Todo[]> | null = null;
  openAddItem: boolean = false;
  title: string = 'Todo リスト';
  // Input => Parent -> Enfant
  // Output => Parent <- Enfant
  inputTest: string = 'Je suis un input venant du parent home.component.ts';
  selectedTodo: Partial<Todo> = {};
  openDeleteModal: boolean = false;
  fakeListUser: FakeUser[] = [];

  fakeUsers: FakeUser[] = [
    {
      id: 1,
      userName: 'User 1',
      email: 'user1@gmail.com',
    },
    {
      id: 2,
      userName: 'User 2',
      email: 'user2@gmail.com',
    },
    {
      id: 3,
      userName: 'User 3',
      email: 'user3@gmail.com',
    },
  ];

  constructor() {
    // console.log('mounted ?');
    // this.loadTodos();
    this.fakeUsers.map((item: FakeUser) => this.fakeListUser.push(item));
  }

  ngOnInit(): void {
    this.loadTodos(); // Charge les tâches au démarrage du composant
  }

  loadTodos(): void {
    this.todos$ = this.homeService.getAll().pipe(
      tap((data) => console.log("Tâches chargées depuis l'API:", data)),
      catchError((error) => {
        console.error('Erreur lors du chargement des tâches:', error);
        // Gérer l'erreur, par exemple en affichant un message à l'utilisateur
        return of([]); // Retourne un Observable vide pour éviter que le flux se termine
      })
    );
  }

  addItem(): void {
    this.selectedTodo = {};
    this.openAddItem = true;
  }

  deleteItem(todo: Todo): void {
    // Ouvre la modale et lui passe la tâche à supprimer
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '350px', // Largeur de la modale
      data: { todo: todo }, // Passe la tâche à la modale via l'objet `data`
    });

    // S'abonne au résultat de la modale après sa fermeture
    // subscribe = comme un useEffect
    /*
      Angular
      myService.getData().subscribe({
      next: (data) => console.log(data),
      error: (err) => console.error(err)
      });

      React 
      myService.getDataPromise() // Supposons que cette fonction retourne une Promise
      .then(data => console.log(data))
      .catch(err => console.error(err));
    */
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // Si l'utilisateur a cliqué sur 'Supprimer' dans la modale
        console.log('Confirmation de suppression pour la tâche :', todo.id);
        this.homeService
          .delete(todo.id)
          /*
            pipe() est comme un ensemble de stations de traitement ou de filtres que vous ajoutez sur ce tuyau. 
            Example
            numbers$.pipe(
              filter(num => num % 2 === 0), // Opérateur 1: Ne garde que les nombres pairs
              map(num => num * 10),         // Opérateur 2: Multiplie chaque nombre par 10
              tap(val => console.log('Valeur après map:', val)) // Opérateur 3: Effet secondaire (pour débogage)
            ).subscribe(finalValue => {
              console.log('Valeur finale reçue par l\'abonné:', finalValue);
            });
          */

          /*
            Vous utilisez pipe() pour définir ce que vous voulez faire avec les données d'un Observable (filtrer, transformer, etc.).
            
            Vous utilisez subscribe() pour démarrer le processus et réagir aux données résultantes.
          */
          .pipe(
            // Appel de la méthode de suppression
            tap(() => {
              console.log('Tâche supprimée avec succès (front-end).');
              this.loadTodos(); // Recharge les tâches après suppression
            }),
            catchError((error) => {
              console.error(
                'Erreur lors de la suppression de la tâche:',
                error
              );
              return of(null); // Gère l'erreur
            })
          )
          .subscribe(); // N'oubliez pas de vous abonner !
      } else {
        console.log(
          "Suppression annulée par l'utilisateur ou fermeture de la modale."
        );
      }
    });
  }

  updateItem(todo: Partial<Todo>): void {
    console.log('updated clicked');
    this.selectedTodo = todo;
    this.openAddItem = true;
  }

  // Cette fonction est appelée lorsque l'événement 'formSubmitted' est émis par l'enfant
  closeTodoForm(): void {
    console.log('clicked');
    // J'ai renommé pour plus de clarté
    this.openAddItem = false; // Cache le formulaire
    console.log("Formulaire de tâche fermé par l'enfant.");
    this.loadTodos(); // IMPORTANT : Recharge les tâches pour mettre à jour l'affichage de la liste
  }
}
