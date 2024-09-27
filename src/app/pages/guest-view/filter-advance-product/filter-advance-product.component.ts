import { afterRender, Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { AuthService } from '../../auth/service/auth.service';
import { CartService } from '../../home/service/cart.service';
import { ToastrService } from 'ngx-toastr';

declare function modal_view_detail([]): any;
declare let $: any;
@Component({
  selector: 'app-filter-advance-product',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ModalProductComponent],
  templateUrl: './filter-advance-product.component.html',
  styleUrl: './filter-advance-product.component.css',
})
export class FilterAdvanceProductComponent {
  price_view: any = null;

  Categories: any = [];
  Colors: any = [];
  Brands: any = [];
  Products_relateds: any = [];
  // Sizes: any = [];

  PRODUCTS: any = [];
  categories_selected: any = [];
  brand_selected: any = [];
  colors_selected: any = [];
  product_selected: any = null;
  variation_selected: any = null;

  constructor(
    public homeService: HomeService,
    private authService: AuthService,
    public cartService: CartService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.homeService.getConfigFilter().subscribe((res: any) => {
      // console.log(res);
      this.Categories = res.categories;
      this.Colors = res.colors;
      this.Brands = res.brands;
      this.Products_relateds = res.products_relateds.data;
    });

    this.homeService.filterAdvanceProduct({}).subscribe((res: any) => {
      console.log(res);
      this.PRODUCTS = res.products.data;
    });

    afterRender(() => {
      modal_view_detail($);
    });
  }

  ngOnInit(): void {
    this.price_view =
      this.authService.token && this.authService.user
        ? 'price_desc'
        : 'price_pvp';
  }

  addCategorie(categorie: any) {
    let INDEX = this.categories_selected.findIndex(
      (item: any) => item == categorie.id
    );
    if (INDEX != -1) {
      this.categories_selected.splice(INDEX, 1);
    } else {
      this.categories_selected.push(categorie.id);
    }
    this.filterAdvanceProduct();
  }

  addBrand(Brand: any) {
    let INDEX = this.brand_selected.findIndex(
      (item: any) => item == Brand.id
    );
    if (INDEX != -1) {
      this.brand_selected.splice(INDEX, 1);
    } else {
      this.brand_selected.push(Brand.id);
    }
    this.filterAdvanceProduct();
  }

  addColor(color: any) {
    let INDEX = this.colors_selected.findIndex(
      (item: any) => item == color.id
    );
    if (INDEX != -1) {
      this.colors_selected.splice(INDEX, 1);
    } else {
      this.colors_selected.push(color.id);
    }
    this.filterAdvanceProduct();
  }

  filterAdvanceProduct() {
    let data = {
      categories_selected: this.categories_selected,
      brand_selected: this.brand_selected,
      colors_selected: this.colors_selected,
    };
    this.homeService.filterAdvanceProduct(data).subscribe((res: any) => {
      //console.log(res);
      this.PRODUCTS = res.products.data;
    });
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
      price_unit:
        this.price_view == 'price_desc'
          ? PRODUCT.price_desc
          : PRODUCT.price_pvp,
      subtotal: this.getTotalPriceProduct(PRODUCT),
      total: this.getTotalPriceProduct(PRODUCT) * 1,
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
}
