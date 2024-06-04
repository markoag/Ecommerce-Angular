import { Component, afterNextRender } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare function password_show_toggle(): any;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  code_user: string = '';

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    public router: Router,
    public activedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.token && this.authService.user) {
      setTimeout(() => {
        this.router.navigateByUrl('/');
      }, 500);
      return;
    }
    this.activedRoute.queryParams.subscribe((res: any) => {
      this.code_user = res.code;
    });

    afterNextRender(() => {
      setTimeout(() => {
        password_show_toggle();
      }, 50);
    });

    if (this.code_user) {
      let data = {
        code_user: this.code_user,
      };
      this.authService.verifiedAuth(data).subscribe((res: any) => {
        console.log(res);
        if (res.message == 403) {
          this.toastr.error('Error', 'El código de activación no es válido');
          return;
        }
        if (res.message == 200) {
          this.toastr.success('Éxito', 'Cuenta activada correctamente');
          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 500);
        }
      });
    }
  }

  login() {
    if (!this.email || !this.password) {
      this.toastr.error('Validacion', 'Por favor ingrese los datos');
      return;
    }
    this.authService.login(this.email, this.password).subscribe(
      (res: any) => {
        console.log(res);
        if (res?.error?.error) {
          this.toastr.error('Error', 'Usuario o contraseña incorrectos');
          return;
        }
        if (res === true) {
          this.toastr.success('Bienvenido', 'Inicio de sesion correcto');
          setTimeout(() => {
            this.router.navigateByUrl('/');
          }, 500);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  showSuccess() {
    this.toastr.success('Hello world!', 'Toastr fun!');
  }
}
