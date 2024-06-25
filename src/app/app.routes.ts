import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { LandingProductComponent } from './pages/guest-view/landing-product/landing-product.component';
import { authGuard } from './pages/auth/service/auth.guard';
import { CartComponent } from './pages/auth-view/cart/cart.component';
import { CheckoutComponent } from './pages/auth-view/checkout/checkout.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'registro',
    component: RegisterComponent,
  },
  {
    path: 'recuperar-contrasena',
    component: ForgotPasswordComponent,
  },
  {
    path: 'producto/:slug',
    component: LandingProductComponent,
  },
  {
    canActivate: [authGuard],
    path: 'carrito-de-compras',
    component: CartComponent,
  },
  {
    canActivate: [authGuard],
    path: 'checkout',
    component: CheckoutComponent,
  },
];
