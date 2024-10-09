import { CommonModule } from '@angular/common';
import { afterNextRender, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { AuthService } from '../../auth/service/auth.service';
import { ToastrService } from 'ngx-toastr';

declare function modal_view_detail([]): any;
declare let $: any;
@Component({
  selector: 'app-compare-product',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ModalProductComponent],
  templateUrl: './compare-product.component.html',
  styleUrl: './compare-product.component.css',
})
export class CompareProductComponent {
  PRODUCTS: any = [];
  price_view: any = null;

  constructor(
    private readonly authService: AuthService,
    private readonly toastr: ToastrService,
  ) {
    afterNextRender(() => {
      this.PRODUCTS = localStorage.getItem('compares')
      ? JSON.parse(localStorage.getItem('compares') ?? '')
      : [];
    });
  }

  ngOnInit() {
    this.price_view =
      this.authService.token && this.authService.user
        ? 'price_desc'
        : 'price_pvp';

        setTimeout(() => {
          modal_view_detail($);
        },50);
  }

  getNewPriceDiscount(product: any, DISCOUNT_FLASH_DISCOUNT: any) {
    let priceType =
      this.price_view == 'price_desc' ? 'price_desc' : 'price_pvp';
    let price = product[priceType];

    if (DISCOUNT_FLASH_DISCOUNT.type_discount == 1) {
      // Discount in percentage
      price -= (price * DISCOUNT_FLASH_DISCOUNT.discount) / 100;
    } else {
      // Discount in price
      price -= DISCOUNT_FLASH_DISCOUNT.discount;
    }

    return price.toFixed(2);
  }

  getTotalPriceProduct(product: any) {
    if (product.discount_g) {
      return this.getNewPriceDiscount(product, product.discount_g);
    }
    if (this.price_view == 'price_desc') {
      return product.price_desc;
    } else {
      return product.price_pvp;
    }
  }

  getTotalPriceView(product: any) {
    if (this.price_view == 'price_desc') {
      return product.price_desc;
    } else {
      return product.price_pvp;
    }
  }

  removeProduct(PRODUCT: any) {
    
    let index = this.PRODUCTS.findIndex((item: any) => item.id == PRODUCT.id);
    if (index != -1) {
      this.PRODUCTS.splice(index, 1);
      setTimeout(() => {
      localStorage.setItem('compares', JSON.stringify(this.PRODUCTS));
      }, 50);
      this.toastr.info('Información','Producto eliminado de la comparación');
    }
  }
}
