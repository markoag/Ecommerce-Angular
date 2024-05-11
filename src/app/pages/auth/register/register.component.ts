import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

declare function password_show_toggle(): any;
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  name: string = '';
  last_name: string = '';
  email: string = '';
  password: string = '';
  phone: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastrService
  ) {}

  register() {
    if (
      !this.name ||
      !this.last_name ||
      !this.email ||
      !this.password ||
      !this.phone
    ) {
      this.toast.error('Validación', 'Todos los campos son requeridos');
      return;
    }
    let data = {
      name: this.name,
      last_name: this.last_name,
      email: this.email,
      password: this.password,
      phone: this.phone,
    }
    this.authService.register(data).subscribe((res: any) => {
      console.log(res);
      this.toast.success('Exito','Ingresa a tu correo para activar tu cuenta');
      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 500);
    });
  }
}
