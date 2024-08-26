import { Component } from '@angular/core';
import { ProfileClientService } from '../service/profile-client.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-profile-client',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './edit-profile-client.component.html',
  styleUrl: './edit-profile-client.component.css',
})
export class EditProfileClientComponent {
  name: string = '';
  last_name: string = '';
  email: string = '';
  phone: string = '';
  bio: string = '';
  fb: string = '';
  gender: string = '';
  address_user: string = '';
  description: string = '';

  constructor(
    public profileClient: ProfileClientService,
    public toaster: ToastrService
  ) {
    this.profileClient.showUsers().subscribe((res: any) => {
      console.log(res);
      this.name = res.name;
      this.last_name = res.last_name;
      this.email = res.email;
      this.phone = res.phone;
      this.bio = res.bio;
      this.fb = res.fb;
      this.gender = res.gender;
      this.address_user = res.address_user;
    });
  }

  updateUser() {
    if (!this.name || !this.last_name) {
      this.toaster.error('Validacion', 'El nombre y apellido son obligatorios');
      return;
    }
    if (!this.email) {
      this.toaster.error('Validacion', 'El email es obligatorio');
      return;
    }
    if (!this.phone) {
      this.toaster.error('Validacion', 'El telefono es obligatorio');
      return;
    }
    let data = {
      name: this.name,
      last_name: this.last_name,
      email: this.email,
      phone: this.phone,
      bio: this.bio,
      fb: this.fb,
      gender: this.gender,
      address_user: this.address_user,
    };
    this.profileClient.updateProfile(data).subscribe((res: any) => {
      console.log(res);
      if (res.message == 403) {
        this.toaster.error('Validación', res.message_text);
      } else {
        this.toaster.success('Éxito', 'Usuario actualizado correctamente');
      }
    });
  }
}
