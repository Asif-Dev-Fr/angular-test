export class Todo {
  id: number;
  text: string;
  createAt: Date;

  constructor(id: number = -1, text: string = '', createAt: Date = new Date()) {
    this.id = id;
    this.text = text;
    this.createAt = createAt;
  }

  copy(): Todo {
    // Utilise le constructeur pour créer une nouvelle instance et copier les propriétés
    // Cela gère mieux les objets Date que Object.assign seul
    return new Todo(this.id, this.text, new Date(this.createAt));
  }
}
