require("dotenv").config(); // S'assure que les variables d'environnement sont chargées

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Teste la connexion à la base de données au démarrage
pool.connect((err, client, done) => {
  if (err) {
    console.error("Erreur de connexion à la base de données:", err.stack);
    process.exit(1); // Arrête l'application si la connexion échoue
  }
  console.log("Connecté à la base de données PostgreSQL !");
  client.release(); // Relâche le client pour qu'il soit réutilisé
});

module.exports = pool;
