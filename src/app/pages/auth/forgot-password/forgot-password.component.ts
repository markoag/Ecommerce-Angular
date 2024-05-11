import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewPasswordComponent } from '../new-password/new-password.component';
import { CodeForgotPasswordComponent } from '../code-forgot-password/code-forgot-password.component';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CodeForgotPasswordComponent, NewPasswordComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  isLoadingMail: any = null;
  isLoadingCode: any = null;

  email: string = '';
  code: string = '';
  new_password: string = '';

  constructor(
    private toastr: ToastrService,
    public authService: AuthService,    
  ) {}

  verifiedMail() {
    if (!this.email) {
      this.toastr.error('Validación', 'El correo es requerido');
    }
    let data = {
      email: this.email,
    };
    this.authService.verifiedMail(data).subscribe((res: any) => {
      console.log(res);
      if(res.message == 200) {
        this.isLoadingMail = 1;
        this.toastr.success('Éxito', 'Correo enviado correctamente');
      } else {
        this.isLoadingMail = null;
        this.toastr.error('Validación', 'El correo ingresado no existe');
      }
    });
  }

  LoadingCode($event: any) {
    this.isLoadingCode = $event;
  }

  CodeV($event: any) {
    this.code = $event;
  }
}
