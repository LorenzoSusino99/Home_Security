import { Routes } from '@angular/router';
import { HouseComponent } from './house/house.component';
import { ProfileComponent } from './profile/profile.component';
import { HomeComponent } from './home/home.component';
import { RouteGuardService } from './shared/route-guard/route-guard.service';


export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'house',
        component: HouseComponent,
        canActivate: [RouteGuardService],
        data: {
            expectedRole: ['admin', 'family']
        }
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [RouteGuardService],
        data: {
            expectedRole: ['admin', 'family']
        }
    },
    {
        path: 'reset-password/:token',
        loadComponent: () => import('./shared/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
    }

];
