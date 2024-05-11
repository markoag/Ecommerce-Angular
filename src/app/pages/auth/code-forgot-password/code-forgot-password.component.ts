import { Component, EventEmitter, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-code-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './code-forgot-password.component.html',
  styleUrl: './code-forgot-password.component.css'
})
export class CodeForgotPasswordComponent {
  code: string = '';
  isLoadingCode: any = null;

  @Output() LoadingCodeStatus: EventEmitter<any> = new EventEmitter();
  @Output() CodeValue: EventEmitter<any> = new EventEmitter();
  constructor(
    private toastr: ToastrService,
    public authService: AuthService,    
  ) {}

  verifiedCode() {
    if (!this.code) {
      this.toastr.error('Validación', 'Necesitas ingresar el código de verificación');
    }
    let data = {
      code: this.code,
    };
    this.authService.verifiedCode(data).subscribe((res: any) => {
      console.log(res);
      if(res.message == 200) {
        this.isLoadingCode = 1;
        this.LoadingCodeStatus.emit(this.isLoadingCode);
        this.CodeValue.emit(this.code);
        this.toastr.success('Éxito', 'Código verificado correctamente');
      } else {
        this.isLoadingCode = null;
        this.LoadingCodeStatus.emit(this.isLoadingCode);
        this.toastr.error('Validación', 'Código incorrecto');
      }
    });
  }
}
