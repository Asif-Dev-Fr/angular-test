require("dotenv").config(); // Charge les variables d'environnement du fichier .env
const express = require("express");
const cors = require("cors"); // Importe le module cors

const todosRoutes = require("./routes/todos.routes");

const app = express();
const PORT = process.env.PORT || 3000; // Utilise le port de .env ou 3000 par défaut

// Middleware pour analyser les corps de requête JSON (pour les POST/PUT)
app.use(express.json());

// Middleware CORS
// C'est CRUCIAL pour qu'Angular puisse communiquer avec ce back-end
// En développement, vous pouvez autoriser toutes les origines (*)
// En production, vous devriez spécifier l'URL de votre front-end Angular (ex: 'http://localhost:4200' si votre front-end est sur ce port)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Permet à votre front-end Angular de faire des requêtes
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Méthodes HTTP autorisées
    allowedHeaders: ["Content-Type", "Authorization"], // Headers autorisés
  })
);

// Routes de l'API
app.use("/api/todos", todosRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${PORT}`);
  console.log(`Accès via : http://localhost:${PORT}`);
});
