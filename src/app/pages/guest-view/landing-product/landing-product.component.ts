import { Component, afterNextRender } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';

declare function modal_view_detail([]): any;
declare function slider_product([]): any;
declare let $: any;

@Component({
  selector: 'app-landing-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalProductComponent],
  templateUrl: './landing-product.component.html',
  styleUrl: './landing-product.component.css',
})
export class LandingProductComponent {
  PRODUCT_SLUG: any;
  PRODUCT_SELECTED: any;
  PRODUCTS_RELATEDS: any = [];
  variation_selected: any = null;
  product_selected_modal: any;

  constructor(
    public homeService: HomeService,
    public activeRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.activeRoute.params.subscribe((res: any) => {
      this.PRODUCT_SLUG = res.slug;
    });
    afterNextRender(() => {
      this.homeService.showProduct(this.PRODUCT_SLUG).subscribe((res: any) => {
        console.log(res);
        if (res.message == 403) {
          this.toastr.error('Validación', res.message_text);
          this.router.navigateByUrl('/');
        } else {
          this.PRODUCT_SELECTED = res.product;
          this.PRODUCTS_RELATEDS = res.products_relateds.data;
          setTimeout(() => {
            modal_view_detail($);
            slider_product($);
          }, 50);
        }
      });
    });
  }

  // Obtener precio del producto por campaña tipo flash
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
  // Obtener precio del producto por camañana normal o sin campaña
  getTotalPriceProduct(product: any) {
    if (product.discount_g) {
      return this.getNewPriceDiscount(product, product.discount_g);
    }
    return product.price_desc;
  }
  // Seleccionar variación del producto
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

  openDetailModal(PRODUCT: any) {
    this.product_selected_modal = null;
    setTimeout(() => {
      this.product_selected_modal = PRODUCT;
    }, 50);
  }
}
