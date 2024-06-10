import { Component, afterNextRender } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { AuthService } from '../../auth/service/auth.service';

declare function modal_view_detail([]): any;
declare function slider_product([]): any;
declare let $: any;

@Component({
  selector: 'app-landing-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalProductComponent],
  templateUrl: './landing-product.component.html',
  styleUrl: './landing-product.component.css',
})
export class LandingProductComponent {
  PRODUCT_SLUG: any;
  PRODUCT_SELECTED: any;
  PRODUCTS_RELATEDS: any = [];
  DISCOUNT_CODE: any;
  DISCOUNT_CAMPAIGN: any;
  variation_selected: any = null;
  product_selected_modal: any;
  price_view: any = null;

  constructor(
    public homeService: HomeService,
    public activeRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
  ) {
    this.activeRoute.params.subscribe((res: any) => {
      this.PRODUCT_SLUG = res.slug;
    });
    this.activeRoute.queryParams.subscribe((res: any) => {
      this.DISCOUNT_CODE = res.campaign_discount;
    });
    afterNextRender(() => {
      this.homeService.showProduct(this.PRODUCT_SLUG, this.DISCOUNT_CODE).subscribe((res: any) => {
        console.log(res);
        if (res.message == 403) {
          this.toastr.error('Validación', res.message_text);
          this.router.navigateByUrl('/');
        } else {
          this.PRODUCT_SELECTED = res.product;
          this.PRODUCTS_RELATEDS = res.products_relateds.data;
          this.DISCOUNT_CAMPAIGN = res.discount_campaign;          
          if (this.DISCOUNT_CAMPAIGN) {
            this.PRODUCT_SELECTED.discount_g = this.DISCOUNT_CAMPAIGN;
          }
          setTimeout(() => {
            modal_view_detail($);
            slider_product($);
          }, 50);
        }
      });
    });
  }

  ngAfterViewInit() {
    this.price_view =
      this.authService.token && this.authService.user
        ? 'price_desc'
        : 'price_pvp';
  }

  // Obtener precio del producto por campaña tipo flash
  getNewPriceDiscount(product: any, DISCOUNT_FLASH_DISCOUNT: any) {
    let priceType = this.price_view == 'price_desc' ? 'price_desc' : 'price_pvp';
    let price = product[priceType];

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
