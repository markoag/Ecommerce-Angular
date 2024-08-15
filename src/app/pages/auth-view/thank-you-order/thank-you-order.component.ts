import { afterRender, Component } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { ActivatedRoute } from '@angular/router';

declare function modal_view_detail([]): any;
declare let $: any;

@Component({
  selector: 'app-thank-you-order',
  standalone: true,
  imports: [],
  templateUrl: './thank-you-order.component.html',
  styleUrl: './thank-you-order.component.css',
})
export class ThankYouOrderComponent {
  ORDER_SELECTED: any;
  ORDER_SELECTED_ID: any;
  constructor(
    public cartService: CartService,
    public activedRoute: ActivatedRoute
  ) {
    activedRoute.params.subscribe((res: any) => {
      this.ORDER_SELECTED_ID = res.order;
    });

    this.cartService.showOrder(this.ORDER_SELECTED_ID).subscribe((res: any) => {
      console.log(res);
      this.ORDER_SELECTED = res.sale;
    });

    afterRender(() => {
      modal_view_detail($);
    });
  }
}
