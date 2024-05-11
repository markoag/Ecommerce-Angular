import { Component, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css',
})
export class NewPasswordComponent {
  new_password: string = '';
  isLoadingCode: any = null;
  @Input() code: any;

  constructor(
    public authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  verifiedNewPass() {
    if (!this.new_password) {
      this.toastr.error('Validación', 'Necesitas ingresar la nueva contraseña');
    }
    let data = {
      new_password: this.new_password,
    };
    this.authService.verifiedNewPass(data).subscribe((res: any) => {
      console.log(res);
      this.toastr.success('Éxito', 'Contraseña actualizada correctamente');
      this.router.navigateByUrl('/login');
    });
  }
}
