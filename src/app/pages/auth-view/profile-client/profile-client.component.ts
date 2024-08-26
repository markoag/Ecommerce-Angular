import { Component } from '@angular/core';
import { EditProfileClientComponent } from './edit-profile-client/edit-profile-client.component';
import { PasswordProfileClientComponent } from './password-profile-client/password-profile-client.component';
import { AddressProfileClientComponent } from './address-profile-client/address-profile-client.component';
import { OrdersProfileClientComponent } from './orders-profile-client/orders-profile-client.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-client',
  standalone: true,
  imports: [EditProfileClientComponent, PasswordProfileClientComponent, AddressProfileClientComponent, OrdersProfileClientComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './profile-client.component.html',
  styleUrl: './profile-client.component.css'
})
export class ProfileClientComponent {

  selectedTab: number = 0;

  selectTab(val: number) {    
    this.selectedTab = val;
  }
}
