export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl?: string; // Optionnel : pour l'affichage visuel
}
