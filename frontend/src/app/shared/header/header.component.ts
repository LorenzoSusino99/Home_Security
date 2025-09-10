/**
 * @description Questo component gesisce la barra di navigazione del sito
 */

import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { UserService } from '../user/user.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { RegisterComponent } from '../register/register.component';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  pageTitle: string = '';
  login: boolean = false;
  account: boolean = false;

  constructor(private dialog: MatDialog,
    private router: Router,
    private userService: UserService) { }

  ngOnInit() {
    if (localStorage.getItem('token') != null) {
      this.userService.checkToken().subscribe(
        {
          next: (response: any) => {
            this.pageTitle = "Home Security System";
            this.login = false;
            this.account = true;
          },
          error: (error: any) => {
            this.pageTitle = "Home Security System";
            this.login = true;
            this.account = false;
          }
        })
    }
    else {
      this.pageTitle = "GestOp";
      this.login = true;
      this.account = false;
    }
  }

  loginAction() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "550px";
    this.dialog.open(LoginComponent, dialogConfig);
  }
  registerAction() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "550px";
    this.dialog.open(RegisterComponent, dialogConfig);
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
