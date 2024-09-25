import { afterRender, Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { AuthService } from '../../auth/service/auth.service';

declare function modal_view_detail([]): any;
declare let $: any;
@Component({
  selector: 'app-filter-advance-product',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ModalProductComponent],
  templateUrl: './filter-advance-product.component.html',
  styleUrl: './filter-advance-product.component.css'
})
export class FilterAdvanceProductComponent {

  price_view: any = null;

Categories: any = [];
Colors: any = [];
Brands: any = [];
Products_relateds: any = [];
// Sizes: any = [];

constructor(
  public homeService: HomeService,
  private authService: AuthService,
) { 

  this.homeService.getConfigFilter().subscribe((res: any) => {
    console.log(res);
    this.Categories = res.categories
    this.Colors = res.colors
    this.Brands = res.brands
    this.Products_relateds = res.products_relateds.data
  });

  this.homeService.filterAdvanceProduct({}).subscribe((res: any) => {
    console.log(res);
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

getTotalPriceView(product: any) {
  if (this.price_view == 'price_desc') {
    return product.price_desc;
  } else {
    return product.price_pvp;
  }
}

}
