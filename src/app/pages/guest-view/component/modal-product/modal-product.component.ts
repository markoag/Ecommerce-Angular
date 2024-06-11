import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AuthService } from '../../../auth/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CartService } from '../../../home/service/cart.service';

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
  sub_variation_selected: any;
  price_view: any = null;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private toastr: ToastrService,
    private router: Router
  ) {}
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
    this.variation_selected = null;
    this.sub_variation_selected = null;
    setTimeout(() => {
      this.variation_selected = variation;
      console.log(this.variation_selected);
      modal_view_detail($);
    }, 50);
  }
  selectSubVariation(subvariation: any) {
    this.sub_variation_selected = null;
    setTimeout(() => {
      this.sub_variation_selected = subvariation;
      console.log(this.sub_variation_selected);
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
    if (this.product_selected.variations.length > 0) {
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
      this.product_selected.variations.length > 0 &&
      this.variation_selected &&
      this.variation_selected.subvariations.length == 0
    ) {
      product_variation_id = this.variation_selected.id;
    }
    if (
      this.product_selected.variations.length > 0 &&
      this.variation_selected &&
      this.variation_selected.subvariations.length > 0
    ) {
      product_variation_id = this.sub_variation_selected.id;
    }
    
    let discount_g = null;

    if (this.product_selected.discount_g) {
      discount_g = this.product_selected.discount_g;
    }

    let data = {
      product_id: this.product_selected.id,
      product_variation_id: product_variation_id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : 0,
      type_campaign: discount_g ? discount_g.type_campaign : null,
      code_coupon: null,
      code_discount: discount_g ? discount_g.code : null,
      quantity: $('#tp-cart-input-value').val(),
      price_unit: this.product_selected.price_pvp,
      subtotal: this.getTotalPriceProduct(this.product_selected),
      total: this.getTotalPriceProduct(this.product_selected) * $('#tp-cart-input-value').val(),
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
}
