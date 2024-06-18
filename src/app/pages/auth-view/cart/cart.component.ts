import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../home/service/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  listCarts: any = [];
  totalCarts: number = 0;
  code_coupon: string = '';

  constructor(public cartService: CartService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.cartService.currentDataCart$.subscribe((res: any) => {
      // console.log(res);
      this.listCarts = res;
      this.totalCarts = this.listCarts
        .reduce((sum: number, item: any) => sum + item.total, 0)
        .toFixed(2);
    });
  }

  deleteCart(CART: any) {
    this.cartService.deleteCart(CART.id).subscribe((res: any) => {
      this.toastr.info(
        'Eliminación',
        'Se elimino el producto ' + CART.product.title + ' del carrito'
      );
      this.cartService.removeCart(CART);
    });
  }

  minusQuantity(cart: any) {
    if (cart.quantity == 1) {
      return;
    }
    cart.quantity = cart.quantity - 1;
    cart.total = parseFloat((cart.quantity * cart.subtotal).toFixed(2));
    this.cartService.updateCart(cart.id, cart).subscribe((res: any) => {
      console.log(res);
      if (res.message == 403) {
        this.toastr.error('Validación', res.message_text);        
      } else {
        this.cartService.changeCart(cart);
      }
    });
  }
  plusQuantity(cart: any) {
    let quantity_old = cart.quantity;
    cart.quantity = cart.quantity + 1;
    cart.total = parseFloat((cart.quantity * cart.subtotal).toFixed(2));
    this.cartService.updateCart(cart.id, cart).subscribe((res: any) => {
      console.log(res);
      if (res.message == 403) {
        cart.quantity = quantity_old;
        cart.total = parseFloat((cart.quantity * cart.subtotal).toFixed(2));
        this.toastr.error('Validación', res.message_text);        
      } else {
        this.cartService.changeCart(cart);
      }
    });
  }

  applyCoupon() {
    if (!this.code_coupon) {
      this.toastr.error('Validación', 'Debe ingresar un código de cupón');
      return;
    }
    let data = {
      code_coupon: this.code_coupon,
    };    
    this.cartService.applyCoupon(data).subscribe((res: any) => {
      // console.log(res);
      if (res.message == 403) {
        this.toastr.error('Validación', res.message_text);
      } else {
        this.cartService.resetCart();        
        this.cartService.listCart().subscribe((res: any) => {          
          res.carts.data.forEach((cart: any) => {
            this.cartService.changeCart(cart)
          });
        });
        this.code_coupon = '';
        this.toastr.success('Éxito', 'Cupón aplicado');
      }
    });
  }
}
