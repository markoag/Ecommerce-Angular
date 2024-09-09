import { afterNextRender, Component } from '@angular/core';
import { EditProfileClientComponent } from './edit-profile-client/edit-profile-client.component';
import { PasswordProfileClientComponent } from './password-profile-client/password-profile-client.component';
import { AddressProfileClientComponent } from './address-profile-client/address-profile-client.component';
import { OrdersProfileClientComponent } from './orders-profile-client/orders-profile-client.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/service/auth.service';
import { ProfileClientService } from './service/profile-client.service';

@Component({
  selector: 'app-profile-client',
  standalone: true,
  imports: [
    EditProfileClientComponent,
    PasswordProfileClientComponent,
    AddressProfileClientComponent,
    OrdersProfileClientComponent,
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './profile-client.component.html',
  styleUrl: './profile-client.component.css',
})
export class ProfileClientComponent {
  selectedTab: number = 0;
  name: string = '';
  gender: string = '';
  avatar: string = '';

  constructor(
    public authService: AuthService,
    public profileClient: ProfileClientService
  ) {
    afterNextRender(() => {
      this.profileClient.showUsers().subscribe((res: any) => {
        console.log(res);
        this.name = res.name;
        this.gender = res.gender;
        this.avatar = res.avatar;
      });
    });
  }

  selectTab(val: number) {
    this.selectedTab = val;
  }

  logout() {
    this.authService.logout();
    setTimeout(() => {
      document.location.reload();
    }, 50);
  }
}
