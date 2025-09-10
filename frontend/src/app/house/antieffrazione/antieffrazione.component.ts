import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { SensoriEffrazioneComponent } from './sensori-effrazione/sensori-effrazione.component';
import { NotificheEffrazioneComponent } from './notifiche-effrazione/notifiche-effrazione.component';

@Component({
  selector: 'app-antieffrazione',
  standalone: true,
  imports: [
    MatExpansionModule,
    SensoriEffrazioneComponent,
    NotificheEffrazioneComponent
  ],
  templateUrl: './antieffrazione.component.html',
  styleUrl: './antieffrazione.component.css'
})
export class AntieffrazioneComponent {

}
