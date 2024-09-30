import { CommonModule } from '@angular/common';
import { afterRender, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { HomeService } from '../../home/service/home.service';
import { AuthService } from '../../auth/service/auth.service';
import { CartService } from '../../home/service/cart.service';
import { ToastrService } from 'ngx-toastr';

declare function modal_view_detail([]): any;
declare let $: any;

@Component({
  selector: 'app-campaing-link',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ModalProductComponent],
  templateUrl: './campaing-link.component.html',
  styleUrl: './campaing-link.component.css',
})
export class CampaingLinkComponent {
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
  min_price: number = 0;
  max_price: number = 0;
  options_aditionals: any = [];
  CODE_DISCOUNT: any = null;
  DISCOUNT_LINK: any = null;

  constructor(
    public homeService: HomeService,
    private authService: AuthService,
    public cartService: CartService,
    private toastr: ToastrService,
    private router: Router,
    public activedRoute: ActivatedRoute
  ) {
    this.homeService.getConfigFilter().subscribe((res: any) => {
      // console.log(res);
      this.Categories = res.categories;
      this.Colors = res.colors;
      this.Brands = res.brands;
      this.Products_relateds = res.products_relateds.data;
    });

    this.activedRoute.params.subscribe((params: any) => {
      this.CODE_DISCOUNT = params.code;
    });

    this.homeService
      .campaingDiscountLink({ code_discount: this.CODE_DISCOUNT })
      .subscribe((res: any) => {
        console.log(res);
        if (res.message == 403) {
          this.toastr.info('Validación', res.message_text);
          return;
        }
        this.PRODUCTS = res.products;
        this.DISCOUNT_LINK = res.discount;
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

    $('#slider-range').slider({
      range: true,
      min: 0,
      max: 2000,
      values: [200, 600],
      slide: (event: any, ui: any) => {
        $('#amount').val('$' + ui.values[0] + ' - $' + ui.values[1]);
        this.min_price = ui.values[0];
        this.max_price = ui.values[1];
      },
      stop: () => {
        // console.log(this.min_price, this.max_price);
        // this.filterAdvanceProduct();
      },
    });
    $('#amount').val(
      '$' +
        $('#slider-range').slider('values', 0) +
        ' - $' +
        $('#slider-range').slider('values', 1)
    );
  }

  reset() {
    window.location.href = '/filtro-productos';
  }

  addOptionAditional(option: string) {
    let INDEX = this.options_aditionals.findIndex(
      (item: any) => item == option
    );
    if (INDEX != -1) {
      this.options_aditionals.splice(INDEX, 1);
    } else {
      this.options_aditionals.push(option);
    }
    this.filterAdvanceProduct();
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
    let INDEX = this.brand_selected.findIndex((item: any) => item == Brand.id);
    if (INDEX != -1) {
      this.brand_selected.splice(INDEX, 1);
    } else {
      this.brand_selected.push(Brand.id);
    }
    this.filterAdvanceProduct();
  }

  addColor(color: any) {
    let INDEX = this.colors_selected.findIndex((item: any) => item == color.id);
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
      min_price: this.min_price,
      max_price: this.max_price,
      price_view: this.price_view,
      options_aditionals: this.options_aditionals,
    };
    this.homeService.filterAdvanceProduct(data).subscribe((res: any) => {
      console.log(res);
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
    if (this.DISCOUNT_LINK) {
      return this.getNewPriceDiscount(product, this.DISCOUNT_LINK);
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

  openQuickViewModal(product: any) {
    this.product_selected = null;
    this.variation_selected = null;
    setTimeout(() => {
      this.product_selected = product;
      if (this.DISCOUNT_LINK) {
        this.product_selected.discount_g = this.DISCOUNT_LINK;
      }
      // modal_view_detail($);
    }, 50);
  }
}
