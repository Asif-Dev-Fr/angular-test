export interface UserRegister {
  username: string;
  email: string;
  password: string;
  // confirmPassword ne sera pas envoyé au backend, c'est juste pour la validation côté client
}

// Vous pouvez ajouter d'autres interfaces ici, par exemple pour le login ou les données utilisateur
export interface UserLogin {
  email: string; // Ou username, selon votre stratégie de login
  password: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  // token: string; // Pour l'instant non, mais plus tard un JWT
  // ... d'autres infos utilisateur
}
