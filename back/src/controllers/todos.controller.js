// src/controllers/todos.controller.js
const todoService = require("../services/todo.service"); // On utilise le service réel maintenant

// Récupérer toutes les tâches
exports.getAllTodos = async (req, res) => {
  try {
    const todos = await todoService.findAll();
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).send("Erreur lors de la récupération des tâches.");
  }
};

// Récupérer une tâche par ID
exports.getTodoById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const todo = await todoService.findById(id);
    if (todo) {
      res.status(200).json(todo);
    } else {
      res.status(404).send("Tâche non trouvée");
    }
  } catch (error) {
    res.status(500).send("Erreur lors de la récupération de la tâche par id.");
  }
};

// Créer une nouvelle tâche
exports.createTodo = async (req, res) => {
  const { text, userId } = req.body;
  if (!text) {
    return res.status(400).send("Le texte de la tâche est requis.");
  }
  // userId est temporaire, sera géré par l'authentification plus tard
  // Pour l'instant, on peut utiliser une valeur par défaut si non fournie.
  const newTodoData = { text, userId: userId || 1 }; // Utilisation de userId 1 par défaut

  try {
    const newTodo = await todoService.create(newTodoData);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).send("Erreur lors de la création de la tâche.");
  }
};

// Mettre à jour une tâche
exports.updateTodo = async (req, res) => {
  const id = parseInt(req.params.id);
  const { text } = req.body; // Récupère les propriétés à mettre à jour

  // Vérifie que l'une des propriétés à mettre à jour est présente
  if (text === undefined) {
    return res
      .status(400)
      .send("Au moins le texte  est requis pour la mise à jour.");
  }

  // Assurez-vous que todoData ne contient que les champs que vous voulez modifier et qui sont valides
  const todoDataToUpdate = {};
  if (text !== undefined) todoDataToUpdate.text = text;

  try {
    const updatedTodo = await todoService.update(id, todoDataToUpdate);
    if (updatedTodo) {
      res.status(200).json(updatedTodo);
    } else {
      res
        .status(404)
        .send("Tâche non trouvée ou aucune modification effectuée.");
    }
  } catch (error) {
    res.status(500).send("Erreur lors de la mise à jour de la tâche.");
  }
};

// Supprimer une tâche
exports.deleteTodo = async (req, res) => {
  console.log("delete api");
  const id = parseInt(req.params.id);
  try {
    const deletedTodo = await todoService.delete(id);
    if (deletedTodo) {
      res.status(204).send(); // 204 No Content
    } else {
      res.status(404).send("Tâche non trouvée");
    }
  } catch (error) {
    res.status(500).send("Erreur lors de la suppression de la tâche.");
  }
};
