import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../services/product/product.service';
import { catchError, filter, finalize, map, of, Subscription, tap } from 'rxjs';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  standalone: true,
})
export class ProductListComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private productDataSubscription: Subscription | undefined;
  productList: Product[] = [];
  allProductList: Product[] = [];
  errorMessage: string = '';
  currentSortColumn: 'id' | 'name' | 'price' | 'category' = 'id';
  currentSortDirection: 'asc' | 'desc' = 'asc';
  loading: boolean = false;
  categoryList: string[] = [];

  ngOnInit(): void {
    this.fetchProductData();
  }

  ngOnDestroy(): void {
    // Désabonne de l'Observable lorsque le composant est détruit pour éviter les fuites de mémoire.
    // C'est nécessaire car nous utilisons un .subscribe() manuel.
    if (this.productDataSubscription) {
      this.productDataSubscription.unsubscribe();
      console.log('Abonnement aux données utilisateur désabonné.');
    }
  }

  fetchProductData() {
    this.loading = true;
    this.productDataSubscription = this.productService
      .getProducts()
      .pipe(
        map((response: Product[]) =>
          response.filter((item) => item.price > 20)
        ),
        tap((data: Product[]) => {
          console.log('product data', data);
          this.categoryList.push('Tout');
          data.map((item: Product) => {
            if (!this.categoryList.includes(item.category)) {
              this.categoryList.push(item.category);
            }
          });
        }),
        catchError((error: any) => {
          console.error(error);
          this.errorMessage =
            error?.message ?? 'An error has occurend in the catchError of pipe';
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        // 3. Utilise subscribe() pour consommer les valeurs finales du flux.
        // C'est le point où les données sont réellement utilisées pour mettre à jour l'état du composant.
        next: (data: Product[] | never) => {
          // Callback 'next': appelé lorsque l'Observable émet une nouvelle valeur.
          this.productList = data; // Met à jour le tableau des utilisateurs avec les données reçues
          this.allProductList = data;
          console.log(
            'productList mise à jour dans le composant via subscribe.next :',
            this.productList
          );
        },
        error: (err: any) => {
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
  }

  // --- LOGIQUE DE TRI ---
  // Renommé et adapté pour le tri uniquement
  // `sortByColumn` sera 'name', 'category', 'price', etc.
  sortProducts(sortByColumn: 'id' | 'name' | 'price' | 'category'): void {
    // Si la colonne cliquée est la même que la colonne de tri actuelle, change la direction
    if (this.currentSortColumn === sortByColumn) {
      this.currentSortDirection =
        this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si c'est une nouvelle colonne, trie en ascendant par défaut
      this.currentSortColumn = sortByColumn;
      this.currentSortDirection = 'asc';
    }

    this.applyFiltersAndSort(); // Réapplique les filtres et le tri avec la nouvelle direction/colonne
  }

  // --- MÉTHODE PRINCIPALE POUR APPLIQUER FILTRES ET TRI ---
  applyFiltersAndSort(): void {
    let tempProducts = [...this.productList]; // Toujours partir de la liste complète

    // 2. Appliquer le TRI
    tempProducts.sort((a: Product, b: Product) => {
      let comparison: number = 0;

      switch (this.currentSortColumn) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        default:
          return 0;
      }

      return this.currentSortDirection === 'asc' ? comparison : -comparison;
    });

    this.productList = tempProducts; // Met à jour la liste affichée
  }

  getSortIcon(column: string): string {
    if (this.currentSortColumn === column) {
      return this.currentSortDirection === 'asc' ? ' ▲' : ' ▼';
    }
    return '▼';
  }

  filterCategory(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedCategory = target.value;
    if (selectedCategory === 'Tout') {
      this.productList = this.allProductList;
    } else if (this.categoryList.includes(selectedCategory)) {
      this.productList = this.allProductList.filter(
        (item) => item.category === selectedCategory
      );
    }
  }
}
