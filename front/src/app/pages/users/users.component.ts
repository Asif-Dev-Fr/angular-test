import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';

interface User {
  userId: number;
  id: number;
  title: string;
  body: string;
}

@Component({
  selector: 'app-users',
  imports: [MatTableModule, MatSortModule, MatButtonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  userList: User[] = [];
  displayedColumns: string[] = ['id', 'title', 'body'];
  selectedTab: number = 1;
  currentSortColumn: string = '';
  currentSortDirection: 'asc' | 'desc' = 'asc';

  async fetchData() {
    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/posts'
      );
      const jsonReponse: User[] = await response.json();
      this.userList = [...jsonReponse.slice(0, 20)];
      console.log('this.userList', this.userList);
    } catch (error) {
      console.error(error);
    }
  }

  constructor() {
    this.fetchData();
  }

  changeTab(selected: number) {
    console.log('selected', selected);
    this.selectedTab = selected;
  }

  // @ViewChild(MatSort) sort: MatSort;

  // ngAfterViewInit() {
  //   this.userList.sort = this.sort;
  // }

  sortTableHtml(sortBy: string): void {
    // Si la colonne cliquée est la même que la colonne de tri actuelle, change la direction
    if (this.currentSortColumn === sortBy) {
      this.currentSortDirection =
        this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si c'est une nouvelle colonne, trie en ascendant par défaut
      this.currentSortColumn = sortBy;
      this.currentSortDirection = 'asc';
    }

    // Effectue le tri en fonction de la colonne et de la direction
    this.userList.sort((a: User, b: User) => {
      let comparison: number = 0;

      switch (sortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'body':
          comparison = a.body.localeCompare(b.body);
          break;
        default:
          return 0; // Pas de tri si la colonne n'est pas reconnue
      }

      // Applique la direction de tri
      return this.currentSortDirection === 'asc' ? comparison : -comparison;
    });

    this.userList = [...this.userList];
  }

  getSortIcon(column: string): string {
    if (this.currentSortColumn === column) {
      return this.currentSortDirection === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  }
}
