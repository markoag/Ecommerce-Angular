import { Component, afterNextRender } from '@angular/core';
import { HomeService } from './service/home.service';
import { CommonModule } from '@angular/common';
import { ModalProductComponent } from '../guest-view/component/modal-product/modal-product.component';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/service/auth.service';
import { CartService } from './service/cart.service';
import { ToastrService } from 'ngx-toastr';

declare function initializeSwiper([]): any;
declare function data_values([]): any;
declare function slider_product([]): any;
declare function modal_view_detail([]): any;
declare let $: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ModalProductComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  SLIDERS: any = [];
  BANNERS_SECUNDARY: any = [];
  BANNERS_PRODUCTS: any = [];
  CATEGORIES_RANDOM: any = [];
  TRENDING_PRODUCT_NEW: any = [];
  TRENDING_PRODUCT_FEATURE: any = [];
  TRENDING_PRODUCT_TOP_SELLER: any = [];
  PRODUCTS_CATEGORY_FIRST: any = [];
  CATEGORY_FIRST: any = [];
  PRODUCTS_CAROUSEL: any = [];
  DISCOUNT_FLASH: any;
  DISCOUNT_FLASH_PRODUCTS: any = [];
  product_selected: any = null;
  variation_selected: any = null;
  price_view: any = null;

  constructor(
    public homeService: HomeService,
    private authService: AuthService,
    public cartService: CartService,
    private toastr: ToastrService,
    private router: Router
  ) {
    afterNextRender(() => {
      this.homeService.home().subscribe((res: any) => {
        console.log(res);
        this.SLIDERS = res.slider_principal;
        this.CATEGORIES_RANDOM = res.categories_random;
        this.TRENDING_PRODUCT_NEW = res.product_trending_new.data;
        this.TRENDING_PRODUCT_FEATURE = res.product_trending_featured.data;
        this.TRENDING_PRODUCT_TOP_SELLER =
          res.product_trending_top_sellers.data;
        this.BANNERS_SECUNDARY = res.slider_secundario;
        this.PRODUCTS_CATEGORY_FIRST = res.product_category_first.data;
        this.CATEGORY_FIRST = res.category_first;
        this.PRODUCTS_CAROUSEL = res.product_carousel.data;
        this.BANNERS_PRODUCTS = res.slider_products;
        this.DISCOUNT_FLASH = res.discount_flash;
        this.DISCOUNT_FLASH_PRODUCTS = res.discount_flash_products;
        setTimeout(() => {
          initializeSwiper($);
          data_values($);
          slider_product($);
        }, 50);
      });
    });
  }

  ngOnInit(): void {
    this.price_view =
      this.authService.token && this.authService.user
        ? 'price_desc'
        : 'price_pvp';
  }

  addCart(PRODUCT: any, FLASH_DISCOUNT: any = null) {
    if (!this.cartService.authService.user) {
      this.toastr.error(
        'Validación',
        'Debes iniciar sesión para agregar productos al carrito'
      );
      this.router.navigateByUrl('/login');
      return;
    }

    if (PRODUCT.variations.length > 0) {
      $('#producQuickViewModal').modal('show');
      this.openQuickViewModal(PRODUCT);
      return;
    }

    let discount_g = null;
    if (FLASH_DISCOUNT) {
      PRODUCT.discount_g = FLASH_DISCOUNT;
    } else {
      discount_g = PRODUCT.discount_g;
    }
    console.log(PRODUCT);    

    let data = {
      product_id: PRODUCT.id,
      product_variation_id: null,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : 0,
      type_campaign: discount_g ? discount_g.type_campaign : null,
      code_coupon: null,
      code_discount: discount_g ? discount_g.code : null,
      quantity: 1,
      // price_unit: PRODUCT.price_pvp,
      price_unit: this.price_view == 'price_desc' ? PRODUCT.price_desc : PRODUCT.price_pvp,
      subtotal: this.getTotalPriceProduct(PRODUCT),
      total: this.getTotalPriceProduct(PRODUCT)*1,
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

  getLabelSlider(SLIDERS: any) {
    let miDiv: any = document.getElementById('label-' + SLIDERS.id);
    miDiv.innerHTML = SLIDERS.label;
    return '';
  }
  getSubtitleSlider(SLIDERS: any) {
    let miDiv: any = document.getElementById('subtitle-' + SLIDERS.id);
    miDiv.innerHTML = SLIDERS.subtitle;
    return '';
  }
  getTitleBannerSecundary(BANNER: any, ID_BANNER: string) {
    let miDiv: any = document.getElementById(ID_BANNER);
    miDiv.innerHTML = BANNER.title;
    return '';
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
  openQuickViewModal(product: any, DISCOUNT_FLASH: any = null) {
    this.product_selected = null;
    this.variation_selected = null;
    setTimeout(() => {
      this.product_selected = product;
      if (DISCOUNT_FLASH) {
        this.product_selected.discount_g = DISCOUNT_FLASH;
      }
      // modal_view_detail($);
    }, 50);
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
