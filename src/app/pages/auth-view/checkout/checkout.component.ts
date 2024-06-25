import { Component, afterNextRender } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { UserAddressService } from '../service/user-address.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  isLoading$: any;
  listCarts: any = [];
  totalCarts: number = 0;

  province: string = '';
  city: string = '';
  parish: string = '';
  company: string = '';
  main_street: string = '';
  secondary_street: string = '';
  reference: string = '';
  sector: string = '';
  house_number: string = '';

  address: any = [];
  provinces: any = [];
  cities: any = [];
  parishes: any = [];
  citiesBackups: any = [];
  parishesBackups: any = [];  

  constructor(
    public cartService: CartService,
    public addressService: UserAddressService,
    private toastr: ToastrService,
  ) {
    afterNextRender(() => {
      this.addressService.listAddress().subscribe((res: any) => {
        console.log(res);
        this.address = res.address.data;
      });
    });
  }

  ngOnInit(): void {
    this.isLoading$ = this.addressService.isLoading$;

    this.cartService.currentDataCart$.subscribe((res: any) => {
      this.listCarts = res;
      this.totalCarts = this.listCarts
        .reduce((sum: number, item: any) => sum + item.total, 0)
        .toFixed(2);
    });
    this.configAll();
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
    this.citiesBackups = this.cities.filter((item: any) => item.province_id == this.province);
    console.log(this.citiesBackups);
  }

  // Filtrar la ciudad seleccionada y mostrar las parroquias correspondientes
  changeCity() {
    this.parishesBackups = this.parishes.filter((item: any) => item.city_id === this.city);
  }

  registerAddress() {

    if (!this.province || !this.city || !this.parish || !this.main_street || !this.secondary_street || !this.reference) {
      this.toastr.error('Validación','Los campos con (*) son obligatorios');
      return;
    }

    let data = {
      province: this.province,
      city: this.city,
      parish: this.parish,
      company: this.company,
      main_street: this.main_street,
      secondary_street: this.secondary_street,
      reference: this.reference,
      sector: this.sector,
      house_number: this.house_number,
    };
    this.addressService.registerAddress(data).subscribe((res: any) => {
      console.log(res);
      this.toastr.success('Éxito','Dirección registrada correctamente');
      this.address.unshift(res.addres);
    });
  }
}
