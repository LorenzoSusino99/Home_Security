import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { SensoriIncendioComponent } from './sensori-incendio/sensori-incendio.component';
import { NotificheIncendioComponent } from './notifiche-incendio/notifiche-incendio.component';

@Component({
  selector: 'app-antincendio',
  standalone: true,
  imports: [
    MatExpansionModule,
    SensoriIncendioComponent,
    NotificheIncendioComponent
  ],
  templateUrl: './antincendio.component.html',
  styleUrl: './antincendio.component.css'
})
export class AntincendioComponent {

}
