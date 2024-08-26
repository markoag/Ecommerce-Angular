import { Component } from '@angular/core';
import { UserAddressService } from '../../service/user-address.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-address-profile-client',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './address-profile-client.component.html',
  styleUrl: './address-profile-client.component.css',
})
export class AddressProfileClientComponent {
  
  province: number = 0;
  city: number = 0;
  parish: number = 0;
  company: string = '';
  main_street: string = '';
  secondary_street: string = '';
  reference: string = '';
  sector: string = '';
  house_number: string = '';
  address_selected: any;
  // description: string = '';

  address: any = [];
  provinces: any = [];
  cities: any = [];
  parishes: any = [];
  citiesBackups: any = [];
  parishesBackups: any = [];

  constructor(
    public addressService: UserAddressService,
    private toastr: ToastrService
  ) {
    this.addressService.listAddress().subscribe((res: any) => {
      console.log(res);
      this.address = res.address.data;
      this.configAll();
    });
  }

  configAll() {
    this.addressService.configAll().subscribe((res: any) => {
      console.log(res);
      this.provinces = res.provinces;
      this.cities = res.cities;
      this.parishes = res.parishes;
    });
  }

  // Filtrar la provincia seleccionada y mostrar las ciudades correspondientes
  changeProvince() {
    this.citiesBackups = this.cities.filter(
      (item: any) => item.province_id == this.province
    );
    // Limpiar las parroquias al cambiar de provincia
    this.parishesBackups = [];
  }

  // Filtrar la ciudad seleccionada y mostrar las parroquias correspondientes
  changeCity() {
    this.parishesBackups = this.parishes.filter(
      (item: any) => item.city_id == this.city
    );
  }

  registerAddress() {
    if (
      !this.province ||
      !this.city ||
      !this.parish ||
      !this.main_street ||
      !this.secondary_street ||
      !this.reference
    ) {
      this.toastr.error('Validación', 'Los campos con (*) son obligatorios');
      return;
    }

    let data = {
      province_id: this.province,
      city_id: this.city,
      parish_id: this.parish,
      company: this.company,
      main_street: this.main_street,
      secondary_street: this.secondary_street,
      reference: this.reference,
      sector: this.sector,
      house_number: this.house_number,
    };
    this.addressService.registerAddress(data).subscribe((res: any) => {
      console.log(res);
      this.toastr.success('Éxito', 'Dirección registrada correctamente');
      this.address.unshift(res.addres);
      this.resetAddress();
    });
  }

  editAddress() {
    if (
      !this.province ||
      !this.city ||
      !this.parish ||
      !this.main_street ||
      !this.secondary_street ||
      !this.reference
    ) {
      this.toastr.error('Validación', 'Los campos con (*) son obligatorios');
      return;
    }

    let data = {
      province_id: this.province,
      city_id: this.city,
      parish_id: this.parish,
      company: this.company,
      main_street: this.main_street,
      secondary_street: this.secondary_street,
      reference: this.reference,
      sector: this.sector,
      house_number: this.house_number,
    };
    this.addressService
      .updateAddress(this.address_selected.id, data)
      .subscribe((res: any) => {
        console.log(res);
        this.toastr.success('Éxito', 'Dirección actualizada correctamente');
        let INDEX = this.address.findIndex(
          (item: any) => item.id == res.addres.id
        );
        if (INDEX != -1) {
          this.address[INDEX] = res.addres;
        }
      });
  }

  selectedAddress(addres: any) {
    this.address_selected = addres;
    this.province = this.address_selected.province.id;
    this.city = this.address_selected.city.code;
    this.parish = this.address_selected.parish.code;
    this.company = this.address_selected.company;
    this.main_street = this.address_selected.main_street;
    this.secondary_street = this.address_selected.secondary_street;
    this.reference = this.address_selected.reference;
    this.sector = this.address_selected.sector;
    this.house_number = this.address_selected.house_number;

    this.changeProvince();
    this.changeCity();
  }

  resetAddress() {
    this.address_selected = null;
    this.province = 0;
    this.city = 0;
    this.parish = 0;
    this.company = '';
    this.main_street = '';
    this.secondary_street = '';
    this.reference = '';
    this.sector = '';
    this.house_number = '';
  }
}
