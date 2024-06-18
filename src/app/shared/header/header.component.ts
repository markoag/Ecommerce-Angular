import { Component, afterNextRender } from '@angular/core';
import { HomeService } from '../../pages/home/service/home.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../pages/home/service/cart.service';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  categories_menu: any = [];
  user: any;
  listCarts: any = [];
  totalCarts: number = 0;
  
  constructor(
    public homeService: HomeService,
    public cartService: CartService,
    private toastr: ToastrService,
  ) {
    afterNextRender(() => {
      this.homeService.menus().subscribe((res: any) => {
        // console.log(res);
        this.categories_menu = res.categories_menu;
      });

      this.user = this.cartService.authService.user;
      if (this.user) {
        this.cartService.listCart().subscribe((res: any) => {
          // console.log(res);
          res.carts.data.forEach((cart: any) => {
            this.cartService.changeCart(cart)
          });
        });
      }
    });
  }

  ngOnInit() {
    this.cartService.currentDataCart$.subscribe((res: any) => {
      // console.log(res);
      this.listCarts = res;
      this.totalCarts = this.listCarts.reduce((sum: number, item: any) => sum + item.total, 0).toFixed(2);
    });    
  }

  deleteCart(CART: any) {
    this.cartService.deleteCart(CART.id).subscribe((res: any) => {
      this.toastr.info('Eliminación', 'Se elimino el producto '+CART.product.title+' del carrito')
      this.cartService.removeCart(CART);
    });
  }

  getIconMenu(menu: any) {
    let miDiv: any = document.getElementById('icon-' + menu.id);
    miDiv.innerHTML = menu.icon;
    return '';
  }
}
