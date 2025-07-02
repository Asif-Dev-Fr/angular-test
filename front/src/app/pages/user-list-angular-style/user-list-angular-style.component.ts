import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  Output,
  EventEmitter,
} from '@angular/core'; // <<< Ajoute OnInit, OnDestroy, inject
import { CommonModule } from '@angular/common'; // Important pour @if, @for, async pipe
import { MatTableModule } from '@angular/material/table';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http'; // <<< Importe HttpClient
import { Observable, Subscription, of } from 'rxjs'; // <<< Importe Observable, Subscription, of
import { map, catchError, tap, finalize } from 'rxjs/operators'; // <<< Importe les opérateurs RxJS

interface User {
  userId: number;
  id: number;
  title: string;
  body: string;
}

@Component({
  selector: 'app-user-list-angular-style',
  standalone: true,
  imports: [
    CommonModule, // Très important pour les pipes et directives comme async
    MatTableModule,
    MatSortModule,
    MatButtonModule,
  ],
  templateUrl: './user-list-angular-style.component.html',
  styleUrl: './user-list-angular-style.component.css',
})
export class UserListAngularStyleComponent implements OnInit, OnDestroy {
  // Propriété pour stocker les données utilisateur une fois qu'elles sont chargées
  userList: User[] = [];

  // Propriété pour gérer l'abonnement à l'Observable. TRÈS IMPORTANT pour éviter les fuites de mémoire.
  private userDataSubscription: Subscription | undefined;

  displayedColumns: string[] = ['id', 'title', 'body'];
  selectedTab: number = 1; // Propriété pour la gestion des onglets (non liée à RxJS)
  currentSortColumn: string = ''; // Mémorise la colonne de tri actuelle
  currentSortDirection: 'asc' | 'desc' = 'asc'; // Mémorise la direction de tri (ascendant/descendant)

  loading: boolean = false; // Indique si les données sont en cours de chargement
  errorMessage: string | null = null; // Stocke un message d'erreur s'il y en a un

  // Injection du service HttpClient
  private http = inject(HttpClient);

  @Output() addHomeComponentText = new EventEmitter<string>();

  constructor() {
    // La récupération des données (appel asynchrone) ne doit pas être faite dans le constructeur.
    // Elle doit être faite dans ngOnInit pour garantir que le composant est pleinement initialisé.
  }

  ngOnInit(): void {
    // Appelle la méthode pour récupérer les données lorsque le composant est initialisé.
    this.fetchData();
  }

  ngOnDestroy(): void {
    // Désabonne de l'Observable lorsque le composant est détruit pour éviter les fuites de mémoire.
    // C'est nécessaire car nous utilisons un .subscribe() manuel.
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
      console.log('Abonnement aux données utilisateur désabonné.');
    }
  }

  /**
   * Récupère les données utilisateur depuis l'API en utilisant HttpClient et RxJS.
   * La méthode est void car elle gère la souscription en interne.
   */
  fetchData(): void {
    this.loading = true; // Commence le chargement, active le spinner
    this.errorMessage = null; // Réinitialise tout message d'erreur précédent

    // 1. Initialise la requête HTTP et obtient un Observable<User[]>
    this.userDataSubscription = this.http
      .get<User[]>('https://jsonplaceholder.typicode.com/posts')
      .pipe(
        // 2. Utilise pipe() pour chaîner les opérateurs RxJS.
        //    pipe() prend un Observable en entrée et renvoie un NOUVEL Observable après transformations.

        // Opérateur map(): Transforme les données émises par l'Observable.
        // Ici, il prend le tableau complet et renvoie les 20 premiers éléments.
        map((response: User[]) => response.slice(0, 5)),

        // Opérateur tap(): Exécute des effets secondaires (comme des console.log) SANS modifier le flux.
        // Utile pour le débogage ou pour déclencher des actions qui n'affectent pas les données passantes.
        tap((data: User[]) =>
          console.log(
            'Données utilisateur chargées (HttpClient & RxJS) :',
            data
          )
        ),

        // Opérateur catchError(): Intercepte les erreurs dans le flux de l'Observable.
        // Il permet de gérer l'erreur et de retourner un nouvel Observable (par exemple, un Observable vide)
        // pour que la chaîne d'Observables ne se termine pas prématurément avec une erreur,
        // ou pour fournir une valeur par défaut.
        catchError((error) => {
          console.error(
            'Erreur lors du chargement des données utilisateur :',
            error
          );
          // Retourne un Observable qui émet un tableau vide et se complète.
          // Cela permet à la souscription de se terminer sans erreur et de vider la liste.
          this.errorMessage = 'Erreur irrécupérable dans pipe !'; // Un message d'erreur plus grave

          return of([]);
        }),

        // Opérateur finalize(): Exécute un callback lorsque l'Observable se termine,
        // que ce soit par succès ou par erreur (après catchError).
        // Idéal pour masquer les indicateurs de chargement.
        finalize(() => {
          this.loading = false; // Arrête le chargement, désactive le spinner
          console.log(
            'Opération de fetching de données terminée (succès ou erreur).'
          );
        })
      )
      .subscribe({
        // 3. Utilise subscribe() pour consommer les valeurs finales du flux.
        // C'est le point où les données sont réellement utilisées pour mettre à jour l'état du composant.
        next: (data: User[] | never) => {
          // Callback 'next': appelé lorsque l'Observable émet une nouvelle valeur.
          this.userList = data; // Met à jour le tableau des utilisateurs avec les données reçues
          console.log(
            'userList mise à jour dans le composant via subscribe.next :',
            this.userList
          );
        },
        error: (err) => {
          // Callback 'error': NORMALEEMENT PAS APPELÉ SI catchError EST PRÉSENT ET GÈRE L'ERREUR.
          // Si catchError relançait l'erreur (ex: return throwError(() => err)), alors ce bloc serait appelé.
          console.error(
            'Erreur finale capturée par subscribe.error (devrait être gérée par catchError) :',
            err
          );
          this.errorMessage = 'Erreur irrécupérable dans subscribe !'; // Un message d'erreur plus grave
        },
        complete: () => {
          // Callback 'complete': appelé lorsque l'Observable a terminé d'émettre des valeurs (ou s'est complété).
          // Pour les requêtes HTTP, il est appelé après 'next' ou 'error'.
          console.log('Souscription de fetching de données terminée.');
        },
      });

    /*
        this.http.get<User[]>('...').pipe(...) : Tout ce qui se trouve à gauche du .subscribe() (c'est-à-dire this.http.get<User[]>('https://jsonplaceholder.typicode.com/posts').pipe(...)) représente un Observable. C'est le "plan" ou la "recette" du flux de données, avec toutes les transformations (map, catchError, finalize) appliquées.

        this.userDataSubscription : C'est une Subscription.

        Quelle est la différence ?

        Observable : La Définition du Flux

        Un Observable est une source de données asynchrones qui peut émettre zéro, un ou plusieurs éléments (valeurs, erreurs ou notifications de complétion) au fil du temps.
        Il est "paresseux" (cold Observable) : il ne commence à "produire" des données que lorsqu'un abonné s'y connecte.
        C'est la définition de ce qui va se passer.
        Vous pouvez chaîner des opérateurs (pipe()) sur un Observable pour le transformer en un nouvel Observable.

        Analogie : L'Observable est comme un tuyau vide ou un plan d'usine. Il ne fait rien tant que l'eau n'y est pas pompée ou que la production n'est pas lancée.

        ----

        Subscription : L'Abonnement Actif au Flux

        Une Subscription est le résultat de l'appel à la méthode .subscribe() sur un Observable.
        C'est la représentation d'un abonnement actif au flux de données d'un Observable.
        Quand vous avez une Subscription, cela signifie que l'Observable a commencé à s'exécuter et que le code de votre subscribe reçoit (ou attend de recevoir) des données.
        L'objet Subscription a une méthode clé : unsubscribe(), qui vous permet de vous désabonner explicitement du flux, d'arrêter de recevoir des notifications et de libérer les ressources associées. C'est crucial pour éviter les fuites de mémoire.
        
        Analogie : La Subscription est comme le robinet ouvert ou la chaîne de production en marche. C'est l'acte de consommer ce que l'Observable produit.

        En résumé :

        L'Observable est le potentiel d'un flux de données.
        La Subscription est la réalisation concrète de ce flux à un moment donné.
      */
  }

  changeTab(selected: number): void {
    console.log('Selected tab:', selected);
    this.selectedTab = selected;
  }

  /**
   * Trie le tableau userList en fonction de la colonne et de la direction spécifiées.
   * Modifie userList en place, puis crée une nouvelle référence pour la détection de changements.
   * @param sortBy Le nom de la colonne par laquelle trier ('id', 'title', ' 'body').
   */
  sortTableHtml(sortBy: string): void {
    // Vérifie si la colonne cliquée est la même que la colonne de tri actuelle.
    // Si oui, change la direction de tri (asc -> desc ou desc -> asc).
    if (this.currentSortColumn === sortBy) {
      this.currentSortDirection =
        this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si c'est une nouvelle colonne, initialise le tri en ascendant.
      this.currentSortColumn = sortBy;
      this.currentSortDirection = 'asc';
    }

    // Effectue le tri en utilisant la méthode native Array.prototype.sort().
    // La fonction de comparaison doit retourner un nombre : négatif (<0) si a vient avant b,
    // positif (>0) si a vient après b, ou zéro (0) si a et b sont égaux pour le tri.
    this.userList.sort((a: User, b: User) => {
      let comparison: number = 0; // Variable pour stocker le résultat de la comparaison initiale

      switch (sortBy) {
        case 'id':
          comparison = a.id - b.id; // Tri numérique pour les IDs
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title); // Tri alphabétique pour les titres
          break;
        case 'body':
          comparison = a.body.localeCompare(b.body); // Tri alphabétique pour les corps
          break;
        default:
          return 0; // Ne fait rien si la colonne n'est pas reconnue
      }

      // Applique la direction de tri finale :
      // Si 'asc', utilise la comparaison telle quelle.
      // Si 'desc', inverse le signe de la comparaison pour inverser l'ordre.
      return this.currentSortDirection === 'asc' ? comparison : -comparison;
    });

    // TRÈS IMPORTANT en Angular : Crée une nouvelle référence du tableau après le tri.
    // Bien que .sort() modifie le tableau en place, créer une nouvelle référence (shallow copy)
    // aide Angular à détecter le changement plus efficacement, surtout avec la stratégie
    // de détection de changements OnPush, et maintient l'immutabilité apparente de l'état.
    this.userList = [...this.userList];
  }

  /**
   * Retourne l'icône de tri (flèche haut ou bas) pour la colonne spécifiée.
   * @param column Le nom de la colonne.
   * @returns Une chaîne de caractères représentant l'icône de tri.
   */
  getSortIcon(column: string): string {
    if (this.currentSortColumn === column) {
      return this.currentSortDirection === 'asc' ? ' ▲' : ' ▼'; // Flèche haut ou bas
    }
    return '▼'; // Pas d'icône si la colonne n'est pas triée
  }

  // Exemple de méthode qui sera appelée par un événement (ex: clic sur un bouton)
  onButtonClick(): void {
    const textToSend = 'Texte envoyé depuis le composant enfant !';
    // <<< MODIFICATION ICI : Émet la chaîne de caractères >>>
    this.addHomeComponentText.emit(textToSend);
    console.log('Enfant a émis :', textToSend);
  }
}
