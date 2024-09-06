import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileClientService } from '../service/profile-client.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-password-profile-client',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './password-profile-client.component.html',
  styleUrl: './password-profile-client.component.css',
})
export class PasswordProfileClientComponent {
  old_password: string = '';
  new_password: string = '';
  new_password2: string = '';

  constructor(
    public profileClient: ProfileClientService,
    public toaster: ToastrService
  ) {
  }

  updateUser() {
    if (!this.old_password) {
      this.toaster.error('Validacion', 'La contraseña antigua es obligatoria');
      return;
    }
    if (!this.new_password || !this.new_password2) {
      this.toaster.error('Validacion', 'Las nuevas contraseñas son obligatorias');
      return;
    } 
    if (this.new_password != this.new_password2) {
      this.toaster.error('Validacion', 'Las nuevas contraseñas no coinciden');
      return;
    }

    let data = {
      old_password: this.old_password,
      new_password: this.new_password,
      new_password2: this.new_password2,      
    };

    this.profileClient.updateProfile(data).subscribe((res: any) => {
      console.log(res);
      if (res.message == 403) {
        this.toaster.error('Validación', res.message_text);
      } else {
        this.toaster.success('Éxito', 'Contraseña actualizada correctamente');
      }
    });
  }
}
