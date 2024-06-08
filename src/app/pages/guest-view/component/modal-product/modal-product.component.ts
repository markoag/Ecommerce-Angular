import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

declare function modal_view_detail([]): any;
declare let $: any;

@Component({
  selector: 'app-modal-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-product.component.html',
  styleUrl: './modal-product.component.css'
})
export class ModalProductComponent {

  @Input() product_selected: any;
  variation_selected: any;

  ngOnInit() {
    setTimeout(() => {
      modal_view_detail($);
    }, 50);
  }

  getNewPriceDiscount(product: any, DISCOUNT_FLASH_DISCOUNT: any) {
    if (DISCOUNT_FLASH_DISCOUNT.type_discount == 1) {
      // Discount in percentage
      let price =
        product.price_desc -
        (product.price_desc * DISCOUNT_FLASH_DISCOUNT.discount) / 100;
      return price.toFixed(2);
    } else {
      // Discount in price
      let price = product.price_desc - DISCOUNT_FLASH_DISCOUNT.discount;
      return price.toFixed(2);
    }
  }
  
  getTotalPriceProduct(product: any) {
    if (product.discount_g) {
      return this.getNewPriceDiscount(product, product.discount_g);
    }
    return product.price_desc;
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
