import { Component, afterNextRender } from '@angular/core';
import { HomeService } from '../../pages/home/service/home.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  categories_menu: any = [];
  
  constructor(public homeService: HomeService) {
    afterNextRender(() => {
      this.homeService.menus().subscribe((res: any) => {
        // console.log(res);
        this.categories_menu = res.categories_menu;
      });
    });
  }

  getIconMenu(menu: any) {
    let miDiv: any = document.getElementById('icon-' + menu.id);
    miDiv.innerHTML = menu.icon;
    return '';
  }
}
