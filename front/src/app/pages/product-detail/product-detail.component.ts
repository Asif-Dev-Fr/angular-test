import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  catchError,
  EMPTY,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { ProductService } from '../../services/product/product.service';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
  standalone: true,
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute); // Injecte ActivatedRoute pour accéder aux paramètres d'URL
  private productService = inject(ProductService); // Injecte ProductService pour récupérer les données

  product$: Observable<Product | undefined> | null = null; // Observable pour le produit (null si non chargé)
  loading: boolean = false; // Indicateur de chargement
  errorMessage: string | null = null; // Message d'erreur

  constructor() {}

  ngOnInit(): void {
    // 1. Initialise l'état de chargement et d'erreur
    this.loading = true;
    this.errorMessage = null;

    this.product$ = this.route.paramMap.pipe(
      // `switchMap` est clé ici : il "change" d'Observable.
      // Quand un nouvel ID est émis par `paramMap`, `switchMap` annule toute requête précédente (si elle est encore en cours)
      // et lance une nouvelle requête pour le nouvel ID.
      switchMap((params) => {
        const id = Number(params.get('id')); // Récupère le paramètre 'id' et le convertit en nombre
        console.log('Fetching product with ID:', id);

        if (isNaN(id) || id <= 0) {
          // Gère le cas où l'ID n'est pas un nombre valide
          this.errorMessage = 'ID de produit invalide.';
          this.loading = false; // Arrête le chargement immédiatement
          return EMPTY; // Retourne un Observable qui ne fait rien (ni next, ni error, ni complete)
        }

        // Appelle le service pour obtenir le produit par son ID.
        //  return this.productService.getProductById(id);
        // OR ⇩
        return this.productService.getProductById(id).pipe(
          map((product) => {
            if (product) {
              // Crée une NOUVELLE instance de Product avec le prix modifié
              // C'est crucial pour ne pas modifier l'objet original du service
              return { ...product, price: product.price * 2 };
            }
            return undefined; // Si aucun produit n'est trouvé
          }),
          tap((product) => {
            if (!product) {
              this.errorMessage = `Produit avec l'ID ${id} non trouvé.`;
            } else {
              console.log('Produit chargé:', product);
            }
          }),
          // Gère les erreurs spécifiques à la récupération du produit
          catchError((error) => {
            console.error('Erreur lors du chargement du produit:', error);
            this.errorMessage =
              'Erreur lors du chargement des détails du produit.';
            return of(undefined); // Retourne un Observable qui émet 'undefined' et se complète
          }),
          finalize(() => {
            this.loading = false; // Arrête le chargement, que ce soit succès ou erreur
          })
        );
      })
      // Un catchError ici attraperait les erreurs du switchMap lui-même, pas de l'Observable interne
      // (c'est pourquoi le catchError est à l'intérieur du switchMap)
    );
  }
}
