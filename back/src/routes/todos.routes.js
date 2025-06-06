const express = require("express");
const router = express.Router();
const todosController = require("../controllers/todos.controller");

// Route pour obtenir toutes les tâches
router.get("/", todosController.getAllTodos);

// Route pour obtenir une tâche par ID
router.get("/:id", todosController.getTodoById);

// Route pour créer une nouvelle tâche
router.post("/", todosController.createTodo);

// Route pour mettre à jour une tâche par ID
router.put("/:id", todosController.updateTodo);

// Route pour supprimer une tâche par ID

const log = (message) => {
  return (req, res, next) => {
    // Retourne une fonction middleware
    console.log(
      `[LOG] ${message} - Request to ${req.method} ${req.originalUrl}`
    );
    next(); // Permet à la requête de passer au gestionnaire suivant
  };
};

router.delete("/:id", log("delete"), todosController.deleteTodo);

module.exports = router;
