import { Component, afterNextRender } from '@angular/core';
import { HomeService } from './service/home.service';
import { CommonModule } from '@angular/common';

declare function initializeSwiper([]): any;
declare function data_values([]): any;
declare function slider_product([]): any;
declare let $: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
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

  constructor(public homeService: HomeService) {
    afterNextRender(() => {
      this.homeService.home().subscribe((res: any) => {
        console.log(res);
        this.SLIDERS = res.slider_principal;
        this.CATEGORIES_RANDOM = res.categories_random;
        this.TRENDING_PRODUCT_NEW = res.product_trending_new.data;
        this.TRENDING_PRODUCT_FEATURE = res.product_trending_featured.data;
        this.TRENDING_PRODUCT_TOP_SELLER = res.product_trending_top_sellers.data;
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

  ngOnInit(): void {}

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
    if (DISCOUNT_FLASH_DISCOUNT.type_discount == 1) { // Discount in percentage
      let price = product.price_desc - ((product.price_desc * DISCOUNT_FLASH_DISCOUNT.discount) / 100);
      return price.toFixed(2);
    } else { // Discount in price
      let price = product.price_desc - DISCOUNT_FLASH_DISCOUNT.discount;
      return price.toFixed(2);
    }
  }
}
