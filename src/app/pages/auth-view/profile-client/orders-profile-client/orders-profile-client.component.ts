import { Component } from '@angular/core';
import { ProfileClientService } from '../service/profile-client.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-orders-profile-client',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './orders-profile-client.component.html',
  styleUrl: './orders-profile-client.component.css',
})
export class OrdersProfileClientComponent {
  sales: any = [];
  sale_detail_review: any;
  rating: number = 0;
  message: string = '';

  constructor(
    public profileClient: ProfileClientService,
    public toastr: ToastrService
  ) {
    this.profileClient.showOrders().subscribe((res: any) => {
      console.log(res);
      this.sales = res.sales.data;
    });
  }

  detailShow(sale: any) {
    sale.sale_detail_show = !sale.sale_detail_show;
  }

  reviewShow(sale_detail: any) {
    this.sale_detail_review = sale_detail;
    if (this.sale_detail_review.review) {
      this.rating = this.sale_detail_review.review.rating;
      this.message = this.sale_detail_review.review.message;
    }
  }

  selectedRating(val: number) {
    this.rating = val;
  }

  backlist() {
    this.sale_detail_review = null;
    this.rating = 0;
    this.message = '';
  }

  saveReview() {
    if (!this.message || !this.rating) {
      this.toastr.error(
        'Validación',
        'Debes seleccionar una calificación y escribir un comentario'
      );
      return;
    }

    let data = {
      product_id: this.sale_detail_review.product_id,
      sale_detail_id: this.sale_detail_review.id,
      message: this.message,
      rating: this.rating,
    };

    if (this.sale_detail_review.review) {
      this.profileClient
        .updateReview(this.sale_detail_review.review.id, data)
        .subscribe((res: any) => {
          this.toastr.success('Éxito', 'Reseña actualizada correctamente');
          this.sale_detail_review.review = res.review;
        });
    } else {
      this.profileClient.registerReview(data).subscribe((res: any) => {
        this.toastr.success('Éxito', 'Reseña registrada correctamente');
        this.sale_detail_review.review = res.review;
      });
    }
  }
}
