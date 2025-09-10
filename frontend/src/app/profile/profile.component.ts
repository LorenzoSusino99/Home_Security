import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../shared/user/user.service';
import { SidenavComponent } from '../shared/sidenav/sidenav.component';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgClass, NgIf, FormsModule, SidenavComponent, HeaderComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: any = {};
  editMode: boolean = false;
  backupUser: any = {};

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getProfile().subscribe(res => {
      this.user = res;
      this.backupUser = { ...res };
      console.log(res)
    });
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.user = { ...this.backupUser };
    }
  }

  save(): void {
    this.userService.updateProfile(this.user).subscribe(() => {
      this.editMode = false;
      this.backupUser = { ...this.user };
    });
  }
}

