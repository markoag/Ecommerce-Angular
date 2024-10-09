import { Component, afterNextRender } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { AuthService } from '../../auth/service/auth.service';
import { CartService } from '../../home/service/cart.service';

declare function modal_view_detail([]): any;
declare function slider_product([]): any;
declare function modal_quantity([]): any;
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
  sub_variation_selected: any = null;
  product_selected_modal: any;
  price_view: any = null;
  plus: number = 0;
  reviews: any = [];

  constructor(
    public homeService: HomeService,
    public activeRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    public cartService: CartService
  ) {
    this.activeRoute.params.subscribe((res: any) => {
      this.PRODUCT_SLUG = res.slug;
    });
    this.activeRoute.queryParams.subscribe((res: any) => {
      this.DISCOUNT_CODE = res.campaign_discount;
    });
    afterNextRender(() => {
      this.homeService
        .showProduct(this.PRODUCT_SLUG, this.DISCOUNT_CODE)
        .subscribe((res: any) => {
          console.log(res);
          if (res.message == 403) {
            this.toastr.error('Validación', res.message_text);
            this.router.navigateByUrl('/');
          } else {
            this.PRODUCT_SELECTED = res.product;
            this.PRODUCTS_RELATEDS = res.products_relateds.data;
            this.DISCOUNT_CAMPAIGN = res.discount_campaign;
            this.reviews = res.reviews;
            if (this.DISCOUNT_CAMPAIGN) {
              this.PRODUCT_SELECTED.discount_g = this.DISCOUNT_CAMPAIGN;
            }
            setTimeout(() => {
              modal_view_detail($);
              slider_product($);
              modal_quantity($);
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
    let priceType =
      this.price_view == 'price_desc' ? 'price_desc' : 'price_pvp';
    let price = product[priceType];
    // Sumar this.plus al precio antes de aplicar el descuento si existe
    price += this.plus;

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
      return product.price_desc + this.plus;
    } else {
      return product.price_pvp + this.plus;
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
    this.variation_selected = null;
    this.sub_variation_selected = null;
    this.plus = 0;
    setTimeout(() => {
      this.plus += variation.price_add;
      this.variation_selected = variation;
      modal_view_detail($);
    }, 50);
  }

  selectSubVariation(subvariation: any) {
    this.sub_variation_selected = null;
    this.plus = this.variation_selected.price_add;
    setTimeout(() => {
      this.plus += subvariation.price_add;
      this.sub_variation_selected = subvariation;
      // console.log(this.sub_variation_selected);
    }, 50);
  }

  openDetailModal(PRODUCT: any) {
    this.product_selected_modal = null;
    setTimeout(() => {
      this.product_selected_modal = PRODUCT;
    }, 50);
  }

  addCart() {
    if (!this.cartService.authService.user) {
      this.toastr.error(
        'Validación',
        'Debes iniciar sesión para agregar productos al carrito'
      );
      this.router.navigateByUrl('/login');
      return;
    }

    let product_variation_id = null;
    if (this.PRODUCT_SELECTED.variations.length > 0) {
      if (!this.variation_selected) {
        this.toastr.error('Validación', 'Debes seleccionar una variación');
        return;
      }
      if (
        this.variation_selected &&
        this.variation_selected.subvariations.length > 0
      ) {
        if (!this.sub_variation_selected) {
          this.toastr.error('Validación', 'Debes seleccionar una subvariación');
          return;
        }
      }
    }

    if (
      this.PRODUCT_SELECTED.variations.length > 0 &&
      this.variation_selected &&
      this.variation_selected.subvariations.length == 0
    ) {
      product_variation_id = this.variation_selected.id;
    }
    if (
      this.PRODUCT_SELECTED.variations.length > 0 &&
      this.variation_selected &&
      this.variation_selected.subvariations.length > 0
    ) {
      product_variation_id = this.sub_variation_selected.id;
    }

    let discount_g = null;

    if (this.PRODUCT_SELECTED.discount_g) {
      discount_g = this.PRODUCT_SELECTED.discount_g;
    }
    console.log(discount_g);

    let data = {
      product_id: this.PRODUCT_SELECTED.id,
      product_variation_id: product_variation_id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : 0,
      type_campaign: discount_g ? discount_g.type_campaign : null,
      code_coupon: null,
      code_discount: discount_g ? discount_g.code : null,
      quantity: $('#tp-cart-input-value').val(),
      // price_unit: this.PRODUCT_SELECTED.price_pvp,
      price_unit:
        this.price_view == 'price_desc'
          ? this.PRODUCT_SELECTED.price_desc
          : this.PRODUCT_SELECTED.price_pvp,
      subtotal: this.getTotalPriceProduct(this.PRODUCT_SELECTED),
      total:
        this.getTotalPriceProduct(this.PRODUCT_SELECTED) *
        $('#tp-cart-input-value').val(),
    };

    this.cartService.registerCart(data).subscribe(
      (res: any) => {
        console.log(res);
        if (res.message == 403) {
          this.toastr.error('Validación', res.message_text);
        } else {
          this.cartService.changeCart(res.cart);
          this.toastr.success('Éxito', 'Producto agregado al carrito');
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  addCompareProduct(PRODUCT: any) {
    // console.log(PRODUCT);
    let COMPARES = localStorage.getItem("compares") ? JSON.parse(localStorage.getItem("compares") ?? '') : [];

    let INDEX = COMPARES.findIndex((item: any) => item.id == PRODUCT.id);
    if (INDEX != -1) {
      this.toastr.error('Validación', 'El producto ya se encuentra en la lista a comparar');
      return;
    }
   
    if (COMPARES.length >= 4) {
      this.toastr.error('Validación', 'Solo puedes comparar hasta 4 productos');
      return;
    }
    COMPARES.push(PRODUCT);
    this.toastr.success('Éxito', 'Producto agregado a comparar');

    localStorage.setItem("compares", JSON.stringify(COMPARES));
    if (COMPARES.length > 1) {
      this.router.navigateByUrl('/comparar-productos');
    }
  }
}
