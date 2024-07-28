import {
  Component,
  ElementRef,
  ViewChild,
  afterNextRender,
} from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { UserAddressService } from '../service/user-address.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

declare var paypal: any;

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
  description: string = '';

  address: any = [];
  provinces: any = [];
  cities: any = [];
  parishes: any = [];
  citiesBackups: any = [];
  parishesBackups: any = [];

  @ViewChild('paypal', { static: true }) paypalElement?: ElementRef;

  constructor(
    public cartService: CartService,
    public addressService: UserAddressService,
    private toastr: ToastrService
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

    paypal
      .Buttons({
        // optional styling for buttons
        // https://developer.paypal.com/docs/checkout/standard/customize/buttons-style-guide/
        style: {
          color: 'gold',
          shape: 'rect',
          layout: 'vertical',
        },

        // set up the transaction
        createOrder: (data: any, actions: any) => {
          // pass in any options from the v2 orders create call:
          // https://developer.paypal.com/api/orders/v2/#orders-create-request-body

          if (this.totalCarts == 0) {
            this.toastr.error(
              'Validación',
              'No puede realizar un pago de $0.00'
            );
            return;
          }
          if (this.listCarts.length == 0) {
            this.toastr.error('Validación', 'No hay productos en el carrito');
            return;
          }
          // Validar que los campos de dirección estén llenos
          if (
            !this.province ||
            !this.city ||
            !this.parish ||
            !this.main_street ||
            !this.secondary_street ||
            !this.reference
          ) {
            this.toastr.error('Validación', 'Los campos de la dirección son obligatorios');
            return;
          }

          const createOrderPayload = {
            purchase_units: [
              {
                amount: {
                  description: 'COMPRAR POR EL ECOMMERCE TAZTINGO',
                  value: this.totalCarts,
                },
              },
            ],
          };

          return actions.order.create(createOrderPayload);
        },

        // finalize the transaction
        onApprove: async (data: any, actions: any) => {
          let Order = await actions.order.capture();

          let dataSale = {
            method_payment: 'PAYPAL',
            discount: 0,
            subtotal: this.totalCarts,
            total: this.totalCarts,
            price: 0,
            n_transaction: Order.purchase_units[0].payments.captures[0].id,
            description: this.description,
            sale_address: {
              province_id: this.province,
              city_id: this.city,
              parish_id: this.parish,
              company: this.company,
              main_street: this.main_street,
              secondary_street: this.secondary_street,
              reference: this.reference,
              sector: this.sector,
              house_number: this.house_number,
            },
          };
          this.cartService.checkout(dataSale).subscribe((res: any) => {
            console.log(res);
            this.toastr.success('Éxito', 'Tú compra se realizó correctamente');
            // Redireccion a la pagina de agradecimiento
            
          });
          // return actions.order.capture().then(captureOrderHandler);
        },

        // handle unrecoverable errors
        onError: (err: any) => {
          console.error(
            'An error prevented the buyer from checking out with PayPal'
          );
        },
      })
      .render(this.paypalElement?.nativeElement);
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
