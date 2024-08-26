import { Component } from '@angular/core';
import { ProfileClientService } from '../service/profile-client.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders-profile-client',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './orders-profile-client.component.html',
  styleUrl: './orders-profile-client.component.css'
})
export class OrdersProfileClientComponent {

  sales: any = [];

  constructor(
    public profileClient: ProfileClientService
  ) {
    this.profileClient.showOrders().subscribe((res: any) => {
      console.log(res);
      this.sales = res.sales.data;
    });
  }

  detailShow(sale: any) {
    sale.sale_detail_show = !sale.sale_detail_show;
  }
}
