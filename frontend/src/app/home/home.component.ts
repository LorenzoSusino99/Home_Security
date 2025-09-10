import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { Router } from '@angular/router';
import { UserService } from '../shared/user/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  constructor(private router: Router,
    private userService: UserService) { }

  ngOnInit(): void {
    if (localStorage.getItem('token') != null) {
      this.userService.checkToken().subscribe(
        {
          next: (response: any) => {
            this.router.navigate(['/house']);
          },
          error: (error: any) => {
            //console.log(error);
          }
        })
    }

  }
}
