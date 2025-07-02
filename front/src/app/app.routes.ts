import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  { path: 'register', component: RegisterComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
