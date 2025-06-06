// src/services/todo.service.js
const pool = require("../config/db.config"); // Importe le pool de connexion

// Récupérer toutes les tâches
exports.findAll = async () => {
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY id ASC");
    return result.rows;
  } catch (err) {
    console.error("Erreur lors de la récupération des tâches:", err);
    throw err; // Propage l'erreur au contrôleur
  }
};

// Récupérer une tâche par ID
exports.findById = async (id) => {
  try {
    const result = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
    return result.rows[0]; // Retourne la première ligne trouvée (ou undefined)
  } catch (err) {
    console.error("Erreur lors de la récupération de la tâche par ID:", err);
    throw err;
  }
};

// Créer une nouvelle tâche
exports.create = async (todoData) => {
  const { text, userId } = todoData;
  try {
    const result = await pool.query(
      'INSERT INTO todos (text, "userId") VALUES ($1, $2) RETURNING *',
      [text, userId]
    );
    return result.rows[0]; // Retourne la tâche nouvellement créée
  } catch (err) {
    console.error("Erreur lors de la création de la tâche:", err);
    throw err;
  }
};

// Mettre à jour une tâche
exports.update = async (id, todoData) => {
  const { text } = todoData; // On s'attend à recevoir le texte
  try {
    const result = await pool.query(
      "UPDATE todos SET text = $1 WHERE id = $2 RETURNING *",
      [text, id]
    );
    return result.rows[0]; // Retourne la tâche mise à jour
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la tâche:", err);
    throw err;
  }
};

// Supprimer une tâche
exports.delete = async (id) => {
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0]; // Retourne l'ID de la tâche supprimée (si trouvée)
  } catch (err) {
    console.error("Erreur lors de la suppression de la tâche:", err);
    throw err;
  }
};
