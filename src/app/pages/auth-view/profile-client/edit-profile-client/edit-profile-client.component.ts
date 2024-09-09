import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
export class EditProfileClientComponent implements OnInit {
  @Output() profileUpdate = new EventEmitter<any>();

  name: string = '';
  last_name: string = '';
  email: string = '';
  phone: string = '';
  bio: string = '';
  fb: string = '';
  gender: string = '';
  address_user: string = '';
  description: string = '';
  img_preview: string = 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png';
  file_image: any = null;

  profile: any = {};

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
      this.img_preview = res.avatar;      
    });
  }

  ngOnInit() {
    // Simulación de datos de perfil iniciales
    this.profile = {
      name: this.name,
      last_name: this.last_name,
      email: this.email,
      phone: this.phone,
      bio: this.bio,
      fb: this.fb,
      avatar: this.img_preview,
    };
    this.profileUpdate.emit(this.profile); // Emitir el perfil inicial
  }

  processFile($event: any) {
    if ($event.target.files[0].type.indexOf('image') < 0) {
      this.toaster.error(
        'Validación',
        'El archivo seleccionado no es una imagen'
      );
      return;
    }
    this.file_image = $event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(this.file_image);
    reader.onloadend = () => {
      this.img_preview = reader.result as string;      
    };
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
    if (!this.gender) {
      this.toaster.error('Validacion', 'El genero es obligatorio');
      return;
    }

    let formData = new FormData();
    formData.append('name', this.name);
    formData.append('last_name', this.last_name);
    formData.append('email', this.email);
    if (this.phone) {
      formData.append('phone', this.phone);
    }
    if (this.bio) {
      formData.append('bio', this.bio);
    }
    if (this.fb) {
      formData.append('fb', this.fb);
    }
    if (this.gender) {
      formData.append('gender', this.gender);
    }
    if (this.address_user) {
      formData.append('address_user', this.address_user);
    }
    if (this.file_image) {
      formData.append('file_image', this.file_image);
    }

    this.profileClient.updateProfile(formData).subscribe((res: any) => {
      console.log(res);
      if (res.message == 403) {
        this.toaster.error('Validación', res.message_text);
        this.profileUpdate.emit(this.profile); // Emitir el evento de actualización de perfil
      } else {
        this.toaster.success('Éxito', 'Usuario actualizado correctamente');
      }
    });
  }
}
