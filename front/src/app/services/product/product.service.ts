// src/app/services/product/product.service.ts
import { Injectable } from '@angular/core';
import { Product } from '../../models/product.model';
import { Observable, of } from 'rxjs'; // of pour simuler un Observable asynchrone

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private products: Product[] = [
    {
      id: 1,
      name: 'Ordinateur Portable XYZ',
      price: 1200,
      category: 'Électronique',
      description: 'Un ordinateur portable puissant pour le travail et le jeu.',
      imageUrl: 'https://placehold.co/100x100/ADD8E6/000000?text=PC',
    },
    {
      id: 2,
      name: 'Smartphone Galaxy S',
      price: 800,
      category: 'Électronique',
      description:
        'Dernier modèle de smartphone avec appareil photo haute résolution.',
      imageUrl: 'https://placehold.co/100x100/F08080/000000?text=Phone',
    },
    {
      id: 3,
      name: 'Livre "Angular Pro"',
      price: 30,
      category: 'Livres',
      description: 'Guide complet pour maîtriser Angular.',
      imageUrl: 'https://placehold.co/100x100/90EE90/000000?text=Book',
    },
    {
      id: 4,
      name: 'Casque Audio BT-500',
      price: 150,
      category: 'Accessoires',
      description: 'Casque sans fil avec annulation de bruit active.',
      imageUrl: 'https://placehold.co/100x100/DDA0DD/000000?text=Headset',
    },
    {
      id: 5,
      name: 'Souris Ergonomique',
      price: 45,
      category: 'Accessoires',
      description: 'Souris confortable pour de longues sessions de travail.',
      imageUrl: 'https://placehold.co/100x100/FFDAB9/000000?text=Mouse',
    },
  ];

  constructor() {}

  getProducts(): Observable<Product[]> {
    // Retourne un Observable pour simuler une récupération asynchrone (comme HTTP)
    return of(this.products);
  }

  getProductById(id: number): Observable<Product | undefined> {
    return of(this.products.find((p) => p.id === id));
  }
}
