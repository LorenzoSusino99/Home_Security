import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { jwtDecode } from 'jwt-decode';
import { MenuItems } from '../menu/menu-items';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatButton,
    MatIcon,
    MatListModule,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {
  token: any = localStorage.getItem('token');
  tokenPayload: any;
  isExpanded = false;

  constructor(public menuItems: MenuItems) {
    this.tokenPayload = jwtDecode(this.token);
  }

}