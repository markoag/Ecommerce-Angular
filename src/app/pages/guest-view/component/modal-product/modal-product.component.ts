import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AuthService } from '../../../auth/service/auth.service';

declare function modal_view_detail([]): any;
declare let $: any;

@Component({
  selector: 'app-modal-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-product.component.html',
  styleUrl: './modal-product.component.css',
})
export class ModalProductComponent {
  @Input() product_selected: any;
  // @Input() DISCOUNT_FLASH: any = null;
  variation_selected: any;
  price_view: any = null;

  constructor(
    private authService: AuthService
  ) {
    
  }
  ngOnInit() {    
    // console.log(this.DISCOUNT_FLASH);
    this.price_view =
      this.authService.token && this.authService.user
        ? 'price_desc'
        : 'price_pvp';
    setTimeout(() => {
      modal_view_detail($);
    }, 50);
  }

  getNewPriceDiscount(product: any, DISCOUNT_FLASH_DISCOUNT: any) {
    let priceType =
      this.price_view == 'price_desc' ? 'price_desc' : 'price_pvp';
    let price = product[priceType];
    // console.log(DISCOUNT_FLASH_DISCOUNT);

    if (DISCOUNT_FLASH_DISCOUNT.type_discount == 1) {
      // Discount in percentage
      price -= (price * DISCOUNT_FLASH_DISCOUNT.discount) / 100;
    } else {
      // Discount in price
      price -= DISCOUNT_FLASH_DISCOUNT.discount;
    }

    // console.log(price);
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

  selectVariation(variation: any) {
    if (variation.subvariation) {
      this.variation_selected = null;
      setTimeout(() => {
        this.variation_selected = variation;
        modal_view_detail($);
      }, 50);
    } else {
      this.variation_selected = null;
    }
  }
}
