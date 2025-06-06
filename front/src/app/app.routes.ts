import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/auth/register/register.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  { path: 'register', component: RegisterComponent },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
